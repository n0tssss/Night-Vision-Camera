document.addEventListener("DOMContentLoaded", function () {
    const imageUpload = document.getElementById("imageUpload");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const filterSliderGreen = document.getElementById("filterSliderGreen");
    const saveImageButton = document.getElementById("saveImage");

    let image = new Image();
    let sliderValue = filterSliderGreen.value;

    // 监听图片上传
    imageUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                image.src = e.target.result;
                image.onload = function () {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    applyFilter(); // 初次渲染
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // 应用滤镜效果
    function applyFilter() {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            if (sliderValue <= 0.5) {
                data[i] = gray * (1 - sliderValue * 0.5);
                data[i + 1] = gray * (1 + sliderValue * 0.5);
                data[i + 2] = gray * (1 + sliderValue * 1.5);
            } else {
                data[i] = gray * (1 - (sliderValue - 0.5) * 2);
                data[i + 1] = gray * (1 + (sliderValue - 0.5) * 4);
                data[i + 2] = gray * (1 - (sliderValue - 0.5) * 2);
            }
        }

        ctx.putImageData(imageData, 0, 0);

        createNightVisionEffect();
    }

    // 创建夜视仪效果的圆形遮罩
    function createNightVisionEffect() {
        ctx.globalCompositeOperation = "destination-in"; // 将绘制的内容设置为遮罩效果

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = (Math.min(canvas.width, canvas.height) / 2) * 0.95; // 使圆形占 95% 宽度

        // 绘制中心圆
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.globalCompositeOperation = "source-over"; // 恢复正常绘制
    }

    // 使用 requestAnimationFrame 优化滤镜应用
    let animationFrameId;
    filterSliderGreen.addEventListener("input", function () {
        sliderValue = filterSliderGreen.value;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        animationFrameId = requestAnimationFrame(applyFilter); // 在下一帧应用滤镜
    });

    // 保存应用滤镜后的图片
    saveImageButton.onclick = function () {
        const link = document.createElement("a");
        link.href = canvas.toDataURL();
        link.download = "night-vision-image.png";
        link.click();
    };
});
