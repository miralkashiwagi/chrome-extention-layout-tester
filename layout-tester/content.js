chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.imageEnabled) {
      document.querySelectorAll(`${message.imageScope} img`).forEach((img) => {
        if (!img.closest("iframe")) {
          if (message.imageUrl === "random") {
            const width = Math.floor(Math.random() * (1500 - 150 + 1)) + 150;
            const height = Math.floor(Math.random() * (1500 - 150 + 1)) + 150;
            img.src = `https://placehold.jp/${width}x${height}.png`;
          } else {
            img.src = message.imageUrl;
          }
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
        // 初期値を保持
        if (!node._originalValue) {
          node._originalValue = node.nodeValue;
        }

        // 元の値を基準に計算
        const originalValue = node._originalValue.trim();
        const ratio =
          message.textRatio === "random"
            ? Math.floor(Math.random() * (300 - 10 + 1)) + 10
            : message.textRatio;
        const newLength = Math.ceil(originalValue.length * (ratio / 100));

        if (newLength === 0) {
          node.nodeValue = originalValue[0] || "";
        } else if (ratio === 50) {
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
