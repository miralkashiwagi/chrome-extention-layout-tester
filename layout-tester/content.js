chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.imageEnabled) {
      document.querySelectorAll(`${message.imageScope} img`).forEach((img) => {
        if (!img.closest("iframe")) {
          img.src = message.imageUrl;
        }
      });
    }

    if (message.textEnabled) {
      const scopeElement = document.querySelector(message.textScope);
      if (!scopeElement) {
        console.error(
          `Element with selector '${message.textScope}' not found.`
        );
        sendResponse({
          status: "error",
          message: `No element found for selector '${message.textScope}'`,
        });
        return;
      }

      const textNodes = [];
      const walker = document.createTreeWalker(
        scopeElement,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            if (node.parentNode.closest("iframe")) {
              return NodeFilter.FILTER_SKIP;
            }
            if (
              message.ignoreAlnum &&
              /^[a-zA-Z0-9._\s]+$/.test(node.nodeValue)
            ) {
              return NodeFilter.FILTER_SKIP;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }

      textNodes.forEach((node) => {
        // 初期値を保持するためのカスタム属性を追加
        if (!node.dataset || !node.dataset.originalValue) {
          node.dataset = { originalValue: node.nodeValue };
        }

        // 元の値を基準に計算
        const originalValue = node.dataset.originalValue.trim();
        const newLength = Math.ceil(
          originalValue.length * (message.textRatio / 100)
        );

        if (newLength === 0) {
          node.nodeValue = originalValue[0] || "";
        } else if (message.textRatio === 50) {
          node.nodeValue = originalValue.slice(0, newLength);
        } else {
          node.nodeValue = originalValue
            .repeat(Math.ceil(newLength / originalValue.length))
            .slice(0, newLength);
        }
      });
    } else {
      // テキスト変更が無効の場合、何も変更しない
      console.log("Text modification is disabled.");
    }

    sendResponse({ status: "success" });
  } catch (error) {
    console.error("Error processing message:", error);
    sendResponse({ status: "error", message: error.message });
  }

  return true;
});
