document.addEventListener("DOMContentLoaded", () => {
  const customImageUrl = document.getElementById("custom-image-url");
  const executeButton = document.getElementById("execute");

  // カスタムURL入力欄の有効化/無効化
  document.querySelectorAll("input[name='image-url']").forEach((radio) => {
    radio.addEventListener("change", () => {
      customImageUrl.disabled = radio.value !== "custom";
    });
  });

  // 実行ボタンの処理
  executeButton.addEventListener("click", () => {
    const imageScope = document.querySelector(
      "input[name='image-scope']:checked"
    ).value;
    const imageUrl = document.querySelector(
      "input[name='image-url']:checked"
    ).value;
    const textScope = document.querySelector(
      "input[name='text-scope']:checked"
    ).value;
    const textRatio = Number(
      document.querySelector("input[name='text-ratio']:checked").value
    );
    const ignoreAlnum = document.getElementById("ignore-alnum").checked;

    const message = {
      imageScope,
      imageUrl: imageUrl === "custom" ? customImageUrl.value : imageUrl,
      textScope,
      textRatio,
      ignoreAlnum,
    };

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        // content.js を動的に注入
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ["content.js"],
          },
          () => {
            console.log("Content script injected.");
            // メッセージを送信
            chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
                alert("エラー: Content scriptが動作していません。");
              } else {
                console.log("Message sent:", response);
              }
            });
          }
        );
      } else {
        console.error("No active tab found.");
        alert("エラー: アクティブなタブが見つかりませんでした。");
      }
    });
  });
});
