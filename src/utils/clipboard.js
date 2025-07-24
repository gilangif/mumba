const clipboard = (text) => {
  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea")
    textarea.value = text

    textarea.style.position = "fixed"
    textarea.style.top = "0"
    textarea.style.left = "0"
    textarea.style.opacity = "0"

    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    try {
      const successful = document.execCommand("copy")
      if (successful) {
        alert("text copied")
      } else {
        alert("failed copy text")
      }
    } catch (err) {
      alert("failed copy text")
    }

    document.body.removeChild(textarea)
  }

  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard
      .writeText(text)
      .then(() => alert("text copied"))
      .catch((err) => fallbackCopy(text))
  } else {
    fallbackCopy(text)
  }
}

export default clipboard
