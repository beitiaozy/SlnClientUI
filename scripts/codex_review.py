import os
import glob
import requests
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 掃描微信小程序代碼文件
files_to_check = []
for ext in ["js", "wxml", "wxss"]:
    files_to_check.extend(glob.glob(f"pages/**/*.{ext}", recursive=True))
    files_to_check.extend(glob.glob(f"components/**/*.{ext}", recursive=True))

print(f"🔍 共找到 {len(files_to_check)} 個文件")

reviews = []

for file_path in files_to_check:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()

        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": "你是一個專業的微信小程序代碼審查助手，請指出問題並給出優化建議。"},
                {"role": "user", "content": f"文件 {file_path} 的內容如下，請審查：\n\n{code}"}
            ],
            temperature=0.3
        )

        suggestion = response.choices[0].message.content
        reviews.append(f"### {file_path}\n{suggestion}\n")

    except Exception as e:
        reviews.append(f"### {file_path}\n❌ 審查失敗: {e}")

review_output = "\n\n".join(reviews)

# 輸出到控制台
print("📝 Codex 審查結果:\n", review_output)

# 如果是 PR，自動發到 PR 評論
event_name = os.getenv("GITHUB_EVENT_NAME")
event_path = os.getenv("GITHUB_EVENT_PATH")

if event_name == "pull_request" and os.path.exists(event_path):
    with open(event_path, "r", encoding="utf-8") as f:
        event_data = json.load(f)
    comments_url = event_data["pull_request"]["comments_url"]

    headers = {
        "Authorization": f"token {os.getenv('GITHUB_TOKEN')}",
        "Content-Type": "application/json",
    }

    payload = {"body": f"🤖 Codex 自動代碼審查結果：\n\n{review_output}"}
    r = requests.post(comments_url, headers=headers, data=json.dumps(payload))
    print("💬 已發送審查結果到 PR 評論:", r.status_code)
