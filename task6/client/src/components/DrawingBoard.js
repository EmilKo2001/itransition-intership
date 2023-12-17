import React, { useEffect, useRef, useState } from "react";
import { socket } from "../App";

const DrawingBoard = ({ boardId, nickname }) => {
    const canvasRef = useRef();
    const bufferCanvasRef = useRef();
    const [drawingHistory, setDrawingHistory] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const bufferCanvas = bufferCanvasRef.current;
        const context = canvas.getContext("2d");
        const bufferContext = bufferCanvas.getContext("2d");
        context.lineWidth = 2;
        context.lineCap = "round";
        bufferContext.lineWidth = 2;
        bufferContext.lineCap = "round";

        const drawPath = (path, ctx) => {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);

            path.forEach((point) => {
                ctx.lineTo(point.x, point.y);
            });

            ctx.stroke();
        };

        const redrawHistory = (history, ctx) => {
            history.forEach((path) => drawPath(path, ctx));
        };

        const startDrawing = (event) => {
            setIsDrawing(true);
            const offsetX = event.clientX - canvas.getBoundingClientRect().left;
            const offsetY = event.clientY - canvas.getBoundingClientRect().top;
            setCurrentPath([{ x: offsetX, y: offsetY }]);
        };

        const continueDrawing = (event) => {
            if (!isDrawing) return;
            const offsetX = event.clientX - canvas.getBoundingClientRect().left;
            const offsetY = event.clientY - canvas.getBoundingClientRect().top;
            setCurrentPath((prevPath) => [...prevPath, { x: offsetX, y: offsetY }]);
            context.clearRect(0, 0, canvas.width, canvas.height);
            redrawHistory([...drawingHistory, currentPath], context);
        };

        const stopDrawing = () => {
            setIsDrawing(false);
            if (currentPath.length > 0) {
                socket.emit('draw', { boardId, nickname, path: currentPath });
                setDrawingHistory((prevHistory) => [...prevHistory, currentPath]);
            }
        };

        const handleMouseDown = (event) => {
            startDrawing(event);
        };

        const handleMouseMove = (event) => {
            continueDrawing(event);
        };

        const handleMouseUp = () => {
            stopDrawing();
        };

        socket.on("draw", (path) => {
            if (path.length === 0) return;
            setDrawingHistory((prevHistory) => [...prevHistory, path]);
            redrawHistory([...drawingHistory, path], context);
        });

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [boardId, nickname, drawingHistory, currentPath, isDrawing]);

    const handleExportToJPEG = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        const data = context.getImageData(0, 0, w, h);
        const compositeOperation = context.globalCompositeOperation;

        context.globalCompositeOperation = "destination-over";
        context.fillStyle = "white";
        context.fillRect(0, 0, w, h);

        const dataUrl = canvas.toDataURL("image/jpeg");

        context.clearRect(0, 0, w, h);
        context.putImageData(data, 0, 0);
        context.globalCompositeOperation = compositeOperation;

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "drawing.jpg";
        link.click();
    };

    return (
        <div>
            <canvas ref={canvasRef} width={800} height={600}></canvas>
            <canvas ref={bufferCanvasRef} style={{ display: "none" }}></canvas>
            <button onClick={handleExportToJPEG}>Export to JPEG</button>
        </div>
    );
};

export default DrawingBoard;
