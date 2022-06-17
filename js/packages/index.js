import html2canvas from "./html2canvas.esm.js"

class image{
  test(){
    html2canvas(document.body).then(canvas => {
      let img = canvas.toDataURL("image/png")
      let imgContainer = document.querySelector(".img-container")
      imgContainer.innerHTML = ""
      let imgElement = document.createElement("img")
      imgElement.src = img
      imgContainer.appendChild(imgElement)
    }
    )
  }
  
}

const a = new image()
a.test()
