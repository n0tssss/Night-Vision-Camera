document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const snapButton = document.getElementById("snap");
    const filterSlider = document.getElementById("filterSlider");

    // 请求访问摄像头
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
        })
        .catch((err) => console.error("Error accessing camera:", err));

    // 应用滤镜效果
    function applyFilter() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // 获取红绿蓝值
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 计算灰度值
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            // 根据滑动条位置选择滤镜效果
            const sliderValue = filterSlider.value;
            if (sliderValue <= 0.5) {
                // 白磷效果
                // 白磷效果偏淡蓝
                // 调整RGB值以得到淡蓝色
                data[i] = gray * (1 - sliderValue * 0.5); // Red
                data[i + 1] = gray * (1 + sliderValue * 0.5); // Green
                data[i + 2] = gray * (1 + sliderValue * 1.5); // Blue
            } else {
                // 绿磷效果
                // 绿磷效果增强绿色
                data[i] = gray * (1 - (sliderValue - 0.5) * 2); // Red
                data[i + 1] = gray * (1 + (sliderValue - 0.5) * 4); // Green
                data[i + 2] = gray * (1 - (sliderValue - 0.5) * 2); // Blue
            }
            data[i + 3]; // Alpha, 不改变透明度
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.style.display = "block";
    }

    // 拍照并保存图片
    snapButton.onclick = function () {
        applyFilter();
        const link = document.createElement("a");
        link.href = canvas.toDataURL();
        link.download = "photo.png";
        link.click();
    };

    // 滑动条改变时更新滤镜强度
    filterSlider.oninput = applyFilter;
});
