chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const scopeSelector = message.imageScope === "main" ? "main" : "body";
  const scopeElement = document.querySelector(scopeSelector); // 対象要素を取得

  if (!scopeElement) {
    console.error(`Element with selector '${scopeSelector}' not found.`);
    sendResponse({
      status: "error",
      message: `No element found for selector '${scopeSelector}'`,
    });
    return; // 処理を終了
  }

  try {
    // 画像置換処理
    document.querySelectorAll(`${scopeSelector} img`).forEach((img) => {
      if (!img.closest("iframe")) {
        img.src = message.imageUrl;
      }
    });

    // テキスト置換処理
    const textNodes = [];
    const walker = document.createTreeWalker(
      scopeElement, // 修正: null でないことを保証
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (node.parentNode.closest("iframe")) {
            return NodeFilter.FILTER_SKIP;
          }
          if (message.ignoreAlnum && /^[a-zA-Z0-9.\s]+$/.test(node.nodeValue)) {
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
      const text = node.nodeValue.trim();
      const newLength = Math.ceil(text.length * (message.textRatio / 100));

      if (newLength === 0) {
        node.nodeValue = text[0] || ""; // 空文字列を処理
      } else if (message.textRatio === 50) {
        node.nodeValue = text.slice(0, newLength);
      } else {
        node.nodeValue = text
          .repeat(Math.ceil(newLength / text.length))
          .slice(0, newLength);
      }
    });

    sendResponse({ status: "success" });
  } catch (error) {
    console.error("Error processing message:", error);
    sendResponse({ status: "error", message: error.message });
  }

  return true; // 非同期レスポンスを許可
});
