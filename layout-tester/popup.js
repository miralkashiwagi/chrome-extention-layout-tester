document.addEventListener("DOMContentLoaded", () => {
  const customImageUrl = document.getElementById("custom-image-url");
  const executeButton = document.getElementById("execute");
  const enableImage = document.getElementById("enable-image");
  const enableText = document.getElementById("enable-text");

  // カスタムURL入力欄の有効化/無効化
  document.querySelectorAll("input[name='image-url']").forEach((radio) => {
    radio.addEventListener("change", () => {
      customImageUrl.disabled = radio.value !== "custom";
    });
  });

  // 実行ボタンの処理
  executeButton.addEventListener("click", () => {
    const imageEnabled = enableImage.checked;
    const textEnabled = enableText.checked;

    const imageScope = imageEnabled
      ? document.querySelector("input[name='image-scope']:checked").value
      : null;
    const imageUrl = imageEnabled
      ? document.querySelector("input[name='image-url']:checked").value
      : null;

    const textScope = textEnabled
      ? document.querySelector("input[name='text-scope']:checked").value
      : null;
    const textRatio = textEnabled
      ? Number(document.querySelector("input[name='text-ratio']:checked").value)
      : null;
    const ignoreAlnum = textEnabled
      ? document.getElementById("ignore-alnum").checked
      : null;

    const message = {
      imageEnabled,
      imageScope,
      imageUrl: imageUrl === "custom" ? customImageUrl.value : imageUrl,
      textEnabled,
      textScope,
      textRatio,
      ignoreAlnum,
    };

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ["content.js"],
          },
          () => {
            console.log("Content script injected.");
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
