const mobileNav = document.querySelector(".mobile-nav-icon");
const navItems = document.querySelector(".navbar .navbar-items");
const shortenedBtn = document.querySelector(".form-wrapper button");
const shortenUrl = document.querySelector(".form-wrapper input");
const error = document.querySelector(".error");
const linksWrapper = document.querySelector(".shorten-result");
let shortenLinks = JSON.parse(localStorage.getItem("shortenLinks")) || [];
let errorString = "";
mobileNav.addEventListener("click", (e) => {
  navItems.classList.toggle("display");
});
let init = () => {
  displayShortenLinks(shortenLinks);
  shortenedBtn.addEventListener("click", async (e) => {
    let shortenUrlValue = shortenUrl.value;
    let valid = true;
    if (!shortenUrlValue.trim()) {
      valid = false;
      errorString = "Please add a link";
    }

    if (!isValidUrl(shortenUrlValue.trim())) {
      valid = false;
      errorString = "Please Enter Valid URL";
    }
    if (!valid) {
      error.innerText = errorString;
      error.classList.remove("hidden");
      shortenUrl.classList.add("input-error");
    } else {
      error.classList.add("hidden");
      shortenUrl.classList.remove("input-error");
      let shorten = await getShortenUrl(shortenUrlValue);
      saveShortenedLink(shorten);
      displayShortenLinks(shortenLinks);
      shortenedBtn.innerText = "Shorten it!";
    }
  });
  linksWrapper.addEventListener("click", (e) => {
    if (e.target.nodeName == "BUTTON") {
      let target = e.target;
      let id = target.getAttribute("id");
      updateCopyButton(target);
      copyShortenedLink(id);
    }
  });
};
init();

function copyShortenedLink(id) {
  shortenLinks.forEach((link) => {
    if (link.id === id) {
      navigator.clipboard.writeText(link.shortenUrl);
    }
  });
}
function updateCopyButton(btn) {
  btn.style.backgroundColor = "hsl(257, 27%, 26%)";
  btn.innerText = "Copied!";
  setTimeout(() => {
    btn.style.backgroundColor = "hsl(180, 66%, 49%)";
    btn.innerText = "Copy";
  }, 2000);
}
async function getShortenUrl(shortenUrlValue) {
  let data = null;
  try {
    shortenedBtn.innerText = "shortening...";
    const response = await axios.post(
      "https://api.tinyurl.com/create",
      {
        url: shortenUrlValue,
        domain: "tinyurl.com",
      },
      {
        headers: {
          Authorization:
            "Bearer bhSmsQIEBkwFnjuVwLxWNNvhBoFdSFiOqsCoSggkWu8sIJgLuH3CWxCW30jH",
        },
      }
    );

    if (response.data) {
      let data = response.data.data;
      let shortenObject = {
        originUrl: shortenUrlValue,
        shortenUrl: data.tiny_url,
        id: data.alias,
      };
      return shortenObject;
    }
  } catch (error) {}
}
function saveShortenedLink(shorten) {
  try {
    shortenLinks.push(shorten);
    localStorage.setItem("shortenLinks", JSON.stringify(shortenLinks));
  } catch (error) {}
}

function displayShortenLinks(links) {
  if (links) {
    let html = links
      .map((link) => {
        return `
         <div class="shortened-item">
            <span class="origin-link"
              >${link.originUrl}</span
            >
            <div class="shortened-actions">
              <span>${link.shortenUrl}</span>
              <button class="copy-shrtened" id=${link.id}>Copy</button>
            </div>
          </div>
        
        `;
      })
      .join("");
    linksWrapper.innerHTML = html;
  }
}
function isValidUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch (e) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}
