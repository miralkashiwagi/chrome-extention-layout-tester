document.addEventListener("DOMContentLoaded", () => {
  const customWidth = document.getElementById("custom-width");
  const customHeight = document.getElementById("custom-height");
  const customTextRatio = document.getElementById("custom-text-ratio");
  const executeButton = document.getElementById("execute");
  const customImageInputs = document.getElementById("custom-size-inputs");
  const customTextInputs = document.getElementById("custom-text-inputs");

  // カスタムURL入力欄の有効化/無効化
  document.querySelectorAll("input[name='image-url']").forEach((radio) => {
    radio.addEventListener("change", () => {
      const isCustom = radio.value === "custom";
      customImageInputs.style.display = isCustom ? "flex" : "none";
    });
  });

  // カスタム長さ入力欄の有効化/無効化
  document.querySelectorAll("input[name='text-ratio']").forEach((radio) => {
    radio.addEventListener("change", () => {
      const isCustom = radio.value === "custom";
      customTextInputs.style.display = isCustom ? "block" : "none";
    });
  });

  // 実行ボタンの処理
  executeButton.addEventListener("click", () => {
    const imageEnabled = document.getElementById("enable-image").checked;
    const imageScope = imageEnabled
      ? document.querySelector("input[name='image-scope']:checked").value
      : null;

    let imageUrl = null;
    if (imageEnabled) {
      const selectedImageOption = document.querySelector(
        "input[name='image-url']:checked"
      ).value;
      if (selectedImageOption === "custom") {
        const width = customWidth.value || "150";
        const height = customHeight.value || "150";
        imageUrl = `https://placehold.jp/${width}x${height}.png`;
      } else {
        imageUrl = selectedImageOption;
      }
    }

    const textEnabled = document.getElementById("enable-text").checked;
    const textScope = textEnabled
      ? document.querySelector("input[name='text-scope']:checked").value
      : null;

    let textRatio = null;
    if (textEnabled) {
      const selectedTextOption = document.querySelector(
        "input[name='text-ratio']:checked"
      ).value;
      if (selectedTextOption === "custom") {
        textRatio = Number(customTextRatio.value) || 200; // 入力が空の場合、200%をデフォルト値に
      } else {
        textRatio = Number(selectedTextOption);
      }
    }

    const ignoreAlnum = textEnabled
      ? document.getElementById("ignore-alnum").checked
      : null;

    const message = {
      imageEnabled,
      imageScope,
      imageUrl,
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
