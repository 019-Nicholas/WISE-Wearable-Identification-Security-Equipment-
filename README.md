# WISE

<p align="center">
  <img src="docs/images/logo.png" width="700">
</p>

### Wearable Intelligent Security Entry

---

## 📖 Deskripsi Proyek

WISE merupakan sistem wearable secure access berbasis AVR yang dirancang untuk mengurangi risiko relay attack pada sistem keyless entry konvensional.

Sistem menggunakan mekanisme transmit-on-demand, sehingga sinyal wireless hanya aktif saat tombol ditekan.

---

## 🎯 Tujuan Proyek

- Mengurangi risiko relay attack
- Mengurangi risiko kehilangan remote kendaraan
- Mengembangkan wearable embedded system berbasis AVR

---

## ⚙️ Fitur Utama

- Wearable-based access system
- Single button multi-command interface
- OLED status display
- Temporary RF transmission
- Magnetic charging dock
- Wireless authentication system

---

## 🔄 Cara Kerja Sistem

1. Wearable berada pada mode sleep untuk menghemat daya.
2. Pengguna menekan tombol pada wearable.
3. OLED aktif dan menampilkan status sistem.
4. Wearable mengirim sinyal RF ke receiver.
5. Receiver melakukan validasi autentikasi.
6. Sistem menjalankan perintah lock/unlock.
7. Wearable kembali ke mode sleep.

---

## 🔧 Komponen Hardware

| Komponen | Fungsi |
|---|---|
| ATmega328P | Wearable controller |
| Arduino Mega 2560 | Receiver controller |
| nRF24L01 | Wireless communication |
| OLED Display | User interface |
| Push Button | Input control |
| LiPo Battery | Power source |
| Magnetic Pogo Pin | Charging connector |
| Relay/Solenoid | Lock mechanism |

---

## 🧭 Visualisasi Sistem

<p align="center">

<a href="docs/images/block_diagram.png">
<img src="https://img.shields.io/badge/System-Block_Diagram-0078D7?style=for-the-badge&logo=diagramsdotnet&logoColor=white">
</a>

<a href="docs/images/flowchart.png">
<img src="https://img.shields.io/badge/Flowchart-PNG-00BCD4?style=for-the-badge&logo=mermaid&logoColor=white">
</a>

<a href="https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Flowchart%20Program%20WISE.drawio.png&dark=auto#R">
<img src="https://img.shields.io/badge/draw.io-Flowchart_Program_WISE-F08705?style=for-the-badge&logo=diagramsdotnet&logoColor=white">
</a>

<a href="docs/images/hardware_design.png">
<img src="https://img.shields.io/badge/Hardware-Design-FF9800?style=for-the-badge&logo=raspberrypi&logoColor=white">
</a>

<a href="docs/images/3d_design.png">
<img src="https://img.shields.io/badge/3D-Design-9C27B0?style=for-the-badge&logo=blender&logoColor=white">
</a>

<a href="docs/images/gui_preview.png">
<img src="https://img.shields.io/badge/GUI-Monitoring-4CAF50?style=for-the-badge&logo=qt&logoColor=white">
</a>

<a href="https://wokwi.com/projects/466366790973248513">
<img src="https://img.shields.io/badge/Wokwi-Simulasi_WISE-E53935?style=for-the-badge&logo=arduino&logoColor=white">
</a>

</p>
---

## 👥 Tim Pengembang

| Nama | NRP | Divisi |
|---|---|---|
| [Nicholas Miftahudin IB](https://github.com/019-Nicholas) | 2124600019 | Project Manager |
| [Susanto Angga Adi P.](https://github.com/022-ANGGA) | 2124600022 | Software Engineer |
| [Aditya Triyoga H.](https://github.com/030-Adityatriyoga) | 2124600030 | Hardware Engineer |
| [Trimuna Tsuroya](https://github.com/TrimunaTsuroya-2125640037) | 2125640037 | 3D Designer |
| [M. Sagara Putra R.](https://github.com/025-Garaa) | 2124600025 | UI/UX Designer |
| [Nauval Putra H.](https://github.com/nauvalph-009)| 2124600009 | UI/UX Designer |

---

## 🚀 Future Development

- Mobile application integration
- Encrypted wireless communication
- Battery optimization system
- BLE communication support
- Real-time vehicle monitoring
- Multi-device authentication
- Compact custom PCB development
- Waterproof wearable casing
