let pencilElement = document.querySelector("#pencil");
let earserElement = document.querySelector("#eraser");
let stickyElement = document.querySelector("#sticky");
let uploadElement = document.querySelector("upload");
let downloadElement = document.querySelector("#download");
let undoElement = document.querySelector("#undo");
let rediElement = document.querySelector("#redo");


//for to design in web pge we use canvas
let canvas = document.querySelector("#board");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let tool = canvas.getContext("2d");
let toolArr = document.querySelectorAll(".tool");
let currentTool = "pencil";
for (let i = 0; i < toolArr.length; i++) {
  toolArr[i].addEventListener("click", function (e) {
    const toolName = toolArr[i].id;
    if (toolName == "pencil") {
      currentTool = "pencil";
      tool.strokeStyle = "pink";
      tool.lineWidth = 5;
    } else if (toolName == "eraser") {
      currentTool = "eraser";
      tool.strokeStyle = "white";
      tool.lineWidth = 105;
    } else if (toolName == "upload") {
      currentTool = "upload";
      uploadFile();
    } else if (toolName == "sticky") {
      currentTool = "sticky";
      createSticky();
    } else if (toolName == "undo") {
      currentTool = "undo";
      undoFN();
    } else if (toolName == "redo") {
      currentTool = "redo";
      redoFN();
    }
  });
}




let undoStack=[];
let redoStack=[];
let isDrawing=false;


canvas.addEventListener("mousedown", function (e) {
  // console.log("x",e.clientX);
  // console.log("y",e.clientY);
  let sidx = e.clientX;
  let sidy = e.clientY;
  // drawing will start from here
  tool.beginPath();
  // jha se press -> canva me
  let toolBarHeight = getYDelta();
  tool.moveTo(sidx, sidy - toolBarHeight);
  isDrawing = true;
  let pointDesc = {
    desc: "md",
    x: sidx,
    y: sidy - toolBarHeight,
    color: tool.strokeStyle,
  };
  undoStack.push(pointDesc);
});
////pencil logic
canvas.addEventListener("mousemove", function (e) {
  if (isDrawing == false) return;
  let eidx = e.clientX;
  let eidy = e.clientY;
  let toolBarHeight = getYDelta();
  tool.lineTo(eidx, eidy - toolBarHeight);
  tool.stroke();
  let pointDesc = {
    desc: "mm",
    x: eidx,
    y: eidy - toolBarHeight,
  };
  undoStack.push(pointDesc);
});
canvas.addEventListener("mouseup", function (e) {
  isDrawing = false;
});


// helper function
let toolBar = document.querySelector(".toolbar");
function getYDelta() {
  let heightOfToolbar = toolBar.getBoundingClientRect().height;
  return heightOfToolbar;
}


//function to create sticky notes

function createSticky(){

  // 1. structure


  // <div class="sticky">
  //   <div class="nav">
  //     <div class="close">X</div>
  //       <div class="minimise"></div>
      
  //   </div>
  //   <textarea class="text-area"></textarea>
  // </div>

  // 2. create
  let stickyDiv=document.createElement("div")
  let navDiv=document.createElement("div")
  let closeDiv=document.createElement("div")
  let minimize=document.createElement("div")
  let textarea=document.createElement("textarea")

  // class styling

  stickyDiv.setAttribute("class", "sticky");
  navDiv.setAttribute("class","nav")
  textarea.setAttribute("class", "text-area");
   

  closeDiv.innerText="X";
  minimize.innerText="min"
  //html structure

  stickyDiv.appendChild(navDiv);
  stickyDiv.appendChild(textarea);
  navDiv.appendChild(minimize);
  navDiv.appendChild(closeDiv);

document.body.appendChild(stickyDiv);

// code for minimization

let isMinimize=false;
closeDiv.addEventListener("click",function(){
  stickyDiv.remove();
})
minimize.addEventListener("click",function(){
  textarea.style.display=isMinimize ?"block":"none";
  isMinimize=!isMinimize
})

let isStickyDown = false;
// navbar -> mouse down , mouse mousemove, mouse up 

navDiv.addEventListener("mousedown", function (e) {
    // initial point
    initialX = e.clientX;
    initialY = e.clientY;
    console.log("mousedown", initialX, initialY);
    isStickyDown = true;
})
navDiv.addEventListener("mousemove", function (e) {
    if (isStickyDown == true) {
        // final point 
        let finalX = e.clientX;
        let finalY = e.clientY;
        console.log("mousemove", finalX, finalY);
        //  distance
        let dx = finalX - initialX;
        let dy = finalY - initialY;
        //  move sticky
        //original top left
        let { top, left } = stickyDiv.getBoundingClientRect()
        // stickyPad.style.top=10+"px";
        stickyDiv.style.top = top + dy + "px";
        stickyDiv.style.left = left + dx + "px";
        initialX = finalX;
        initialY = finalY;
    }
})
navDiv.addEventListener("mouseup", function () {
    isStickyDown = false;
})
return stickyDiv;

}