# Yoyo點點名 (YOYO Clock In/Out System)

<div align="center">

**Track Time. Boost Productivity.**

*A cloud-native employee attendance tracking system built by Group 9*


[![Documentation](https://img.shields.io/badge/📚_Documentation-Notion-orange?style=for-the-badge)](https://www.notion.so/1a40af495364802da2dfeffc53643dce?pvs=4)

</div>

---

## 👥 Group Members


| Member | Role | GitHub | Contribution |
|--------|------|--------|--------------|
| 楊喻妃 | PM | [![GitHub](https://img.shields.io/badge/GitHub-fly0331-black?style=flat-square&logo=github)](https://github.com/fly0331) | PM & Frontend |
| 侯岳昇 | Developer | [![GitHub](https://img.shields.io/badge/GitHub-jushengtin2-black?style=flat-square&logo=github)](https://github.com/jushengtin2) | Backend &  DevOps |
| 洪睿謙 | Developer | [![GitHub](https://img.shields.io/badge/GitHub-PogLotti-black?style=flat-square&logo=github)](https://github.com/PogLotti) | Backend &  QA |
| 徐天祐 | Developer | [![GitHub](https://img.shields.io/badge/GitHub-Yoyo8787-black?style=flat-square&logo=github)](https://github.com/Yoyo8787) |  Frontend & DevOps |
| 陳冠儒 | Developer | [![GitHub](https://img.shields.io/badge/GitHub-KJChen3-black?style=flat-square&logo=github)](https://github.com/KJChen3) |  Backend &  QA |



---

## 🎯 System Overview

The **Yoyo Clock In/Out System** leverages access logs from office gates, parking gates, and other entry points to automatically determine employee clock-in and clock-out times. This eliminates manual time tracking and provides accurate, real-time attendance monitoring.

### 🏗️ System Architecture

![System Architecture](https://github.com/113-2-cloud-native-G9/in-out-system/blob/main/ReadmeFile/System%20Architecture.png) 

---

## 📊 Key Features & UI Showcase
### ✅ Smart Check-In/Out Tracking
- **Precise Timestamp Records** with millisecond accuracy
- **Gate & Location Tracking** for comprehensive audit trails
- **Automatic Work Hour Calculation** based on first-in, last-out logic

### 📈 Advanced Attendance Dashboard
- **Real-time Statistics**: Live attendance tracking with instant updates
- **Visual Analytics**: Interactive charts showing attendance trends
- **Calendar Integration**: Monthly view with color-coded attendance status
- **Performance Metrics**: Key performance indicators at a glance

### 📊 Comprehensive Reporting System
- **Data-Driven Insights** with exportable reports
- **Department-specific Attendance Reports** with filtering capabilities
- **Late Arrival Tracking** with automated notifications
- **Trend Analysis** for workforce optimization

### 🏢 Organization Management
- **Dynamic Organizational Structure** with interactive tree visualization
- **Department & Status-based Filtering** for targeted analysis
- **Role-based Access Control** ensuring data security
- **Hierarchical Management** supporting complex org structures

---

## 🏢 User Role Analysis



### 👤 Employee
- Clock in/out functionality
- Check personal records
- Export attendance history

### 👔 Manager  
- Monitor team attendance
- Generate department reports
- Track late arrivals & early departures

### ⚙️ Administrator
- User/Organization management
- System configuration
- Advanced analytics & insights

</div>

---



## 🛠️ Development Tools & CI/CD Pipeline

### Project Management
- **Notion**: Comprehensive project documentation and planning
- **GitHub**: Version control with collaborative development

### Testing & Quality Assurance  
- **Unit Testing**: React Testing Library + pytest
- **Test Coverage**: 84% statement coverage rate
- **Quality Gates**: Automated code quality checks

### CI/CD Pipeline
```mermaid
graph LR
    A[Set up environment] --> B[Install dependency]
    B --> C[Run Test]
    C --> D[gcloud Authorization] 
    D --> E[Build Docker]
    E --> F[Deploy]
```

---



**NTU IM 113-2 雲原生應用程式開發**

*Track Time. Boost Productivity. Yoyo點點名.*

[![Frontend](https://img.shields.io/badge/Frontend-React_18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Flask_3.0-green?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![Database](https://img.shields.io/badge/Database-MySQL_8.0-orange?style=for-the-badge&logo=mysql)](https://mysql.com/)
[![Cloud](https://img.shields.io/badge/Cloud-Google_Cloud-red?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/)
[![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker)](https://docker.com/)

---

### 📊 Project Statistics

<table align="center">
<tr>
<td align="center"><strong>📈 Performance</strong></td>
<td align="center"><strong>🧪 Quality</strong></td>
<td align="center"><strong>🚀 Deployment</strong></td>
</tr>
<tr>
<td align="center">
<img src="https://img.shields.io/badge/Response_Time-150ms-green?style=flat-square" alt="Response Time"/><br/>
<img src="https://img.shields.io/badge/Uptime-99.95%25-green?style=flat-square" alt="Uptime"/><br/>
<img src="https://img.shields.io/badge/Users-1000+-blue?style=flat-square" alt="Concurrent Users"/>
</td>
<td align="center">
<img src="https://img.shields.io/badge/Test_Coverage-84%25-green?style=flat-square" alt="Test Coverage"/><br/>
<img src="https://img.shields.io/badge/Code_Quality-A+-green?style=flat-square" alt="Code Quality"/><br/>
<img src="https://img.shields.io/badge/Security-95%25-green?style=flat-square" alt="Security Score"/>
</td>
<td align="center">
<img src="https://img.shields.io/badge/CI/CD-Automated-blue?style=flat-square" alt="CI/CD"/><br/>
<img src="https://img.shields.io/badge/Docker-Containerized-blue?style=flat-square" alt="Containers"/><br/>
<img src="https://img.shields.io/badge/GCP-Cloud_Native-red?style=flat-square" alt="Platform"/>
</td>
</tr>
</table>

---



**[⬆ Back to Top](#yoyo點點名-yoyo-clock-inout-system)**

</div>
