



//Select canvas tag and give it A4 size
let canvas = document.querySelector("#board");
canvas.width = 1240; // Width of A4 at 300 DPI
canvas.height = 1754; // Height of A4 at 300 DPI
let tool = canvas.getContext("2d");

// Function to add watermark
function addWatermark() {
    tool.save();
    tool.font = "100px Arial";
    tool.fillStyle = "rgba(0, 0, 0, 0.2)";
    tool.textAlign = "center";
    tool.textBaseline = "middle";
    tool.fillText("kushdev", canvas.width / 2, canvas.height / 2);
    tool.restore();
}
function addcanva(){
    let canvas = document.querySelector("#board");
    canvas.width = 1240; // Width of A4 at 300 DPI
    canvas.height = 1754; // Height of A4 at 300 DPI
    let tool = canvas.getContext("2d");
    addWatermark();
}
let add1more=document.querySelector(".add1more")
add1more.addEventListener("click",addcanva);


addWatermark();

















/***************** Tool Selector Logic ***********/
let toolsArr = document.querySelectorAll(".tool");
let currentTool = "pencil";
for (let i = 0; i < toolsArr.length; i++) {
    toolsArr[i].addEventListener("click", function (e) {
        const toolName = toolsArr[i].id;
        if (toolName == "pencil") {
            currentTool = "pencil";
            tool.strokeStyle = "blue";
            tool.lineWidth = 1;
            console.log("pencil clicked");
        } else if (toolName == "eraser") {
            currentTool = "eraser";
            tool.strokeStyle = "white";
            tool.lineWidth = 50;
        } else if (toolName == "download") {
            console.log("download clicked");
            currentTool = "download";
            downloadPDF();
        } else if (toolName == "sticky") {
            currentTool = "sticky";
            createSticky();
        } else if (toolName == "upload") {
            currentTool = "upload";
            console.log(e.target);
            uploadFile();
        } else if (toolName == "undo") {
            currentTool = "undo";
            undoFN();
        } else if (toolName == "redo") {
            console.log("redo clicked");
            redoFN();
        }
    });
}

/*************** Draw Something on Canvas *************/
let undoStack = [];
let redoStack = [];
let isDrawing = false;
/******* Pencil ***********/
canvas.addEventListener("mousedown", function (e) {
    let { offsetX, offsetY } = e;
    tool.beginPath();
    tool.moveTo(offsetX, offsetY);
    isDrawing = true;
    let pointDesc = {
        desc: "md",
        x: offsetX,
        y: offsetY,
        color: tool.strokeStyle,
        lineWidth: tool.lineWidth
    }
    undoStack.push(pointDesc);
    redoStack = []; // Clear redo stack on new action
});
canvas.addEventListener("mousemove", function (e) {
    if (!isDrawing) return;
    let { offsetX, offsetY } = e;
    tool.lineTo(offsetX, offsetY);
    tool.stroke();
    let pointDesc = {
        desc: "mm",
        x: offsetX,
        y: offsetY,
        color: tool.strokeStyle,
        lineWidth: tool.lineWidth
    }
    undoStack.push(pointDesc);
});
canvas.addEventListener("mouseup", function (e) {
    isDrawing = false;
    // Store the current state of the canvas in the undo stack
    undoStack.push({desc: "snapshot", data: tool.getImageData(0, 0, canvas.width, canvas.height)});
    redraw();
});

/******** Helper Function ****/
let toolBar = document.querySelector(".toolbar");
function getYDelta() {
    let heightOfToolbar = toolBar.getBoundingClientRect().height;
    return heightOfToolbar;
}

function createOuterShell() {
    let stickyDiv = document.createElement("div");
    let navDiv = document.createElement("div");
    let closeDiv = document.createElement("div");
    let minimizeDiv = document.createElement("div");

    // Class styling
    stickyDiv.setAttribute("class", "sticky");
    navDiv.setAttribute("class", "nav");

    closeDiv.innerText = "X";
    minimizeDiv.innerText = "min";
    // HTML structure
    stickyDiv.appendChild(navDiv);
    navDiv.appendChild(minimizeDiv);
    navDiv.appendChild(closeDiv);
    document.body.appendChild(stickyDiv);

    /********** Functionality ******/
    let isMinimized = false;
    closeDiv.addEventListener("click", function () {
        stickyDiv.remove();
    });
    minimizeDiv.addEventListener("click", function () {
        let textArea = stickyDiv.querySelector("textarea");
        textArea.style.display = isMinimized ? "block" : "none";
        isMinimized = !isMinimized;
    });

    let isStickyDown = false;

    navDiv.addEventListener("mousedown", function (e) {
        initialX = e.clientX;
        initialY = e.clientY;
        isStickyDown = true;
    });
    navDiv.addEventListener("mousemove", function (e) {
        if (isStickyDown) {
            let finalX = e.clientX;
            let finalY = e.clientY;
            let dx = finalX - initialX;
            let dy = finalY - initialY;
            let { top, left } = stickyDiv.getBoundingClientRect();
            stickyDiv.style.top = top + dy + "px";
            stickyDiv.style.left = left + dx + "px";
            initialX = finalX;
            initialY = finalY;
        }
    });
    navDiv.addEventListener("mouseup", function () {
        isStickyDown = false;
    });
    return stickyDiv;
}

/******* Create Sticky ******/
function createSticky() {
    let stickyDiv = createOuterShell();
    let textArea = document.createElement("textarea");
    textArea.setAttribute("class", "text-area");
    stickyDiv.appendChild(textArea);
}

let inputTag = document.querySelector(".input-tag");
function uploadFile() {
    inputTag.click();
    inputTag.addEventListener("change", function () {
        let data = inputTag.files[0];
        let img = document.createElement("img");
        let url = URL.createObjectURL(data);
        img.src = url;
        img.setAttribute("class", "upload-img");
        let stickyDiv = createOuterShell();
        stickyDiv.appendChild(img);
    });
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    let pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
    pdf.addImage(canvas.toDataURL("image/png"), 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save("file.pdf");
}

function redraw() {
    // Clear the canvas
    tool.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all the points in the undo stack
    for (let i = 0; i < undoStack.length; i++) {
        let { desc, data, x, y, color, lineWidth } = undoStack[i];
        if (desc === "snapshot") {
            tool.putImageData(data, 0, 0);
        } else if (desc === "md") {
            tool.beginPath();
            tool.strokeStyle = color || tool.strokeStyle;
            tool.lineWidth = lineWidth || tool.lineWidth;
            tool.moveTo(x, y);
        } else if (desc === "mm") {
            tool.lineTo(x, y);
            tool.stroke();
        }
    }
    // Redraw the watermark after undo/redo
    addWatermark();
}

function undoFN() {
    if (undoStack.length > 0) {
        redoStack.push(undoStack.pop());
        redraw();
    }
}

function redoFN() {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        redraw();
    }
}

// Add watermark when the page loads

