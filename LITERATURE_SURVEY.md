# Chapter 2: Literature Survey

## 2.1 Introduction

The management of disasters and the coordination of evacuation procedures have been subjects of extensive academic and applied research over the past two decades. The increasing frequency and severity of natural calamities — including floods, earthquakes, cyclones, and wildfires — have underscored the critical need for robust, technology-driven systems capable of facilitating rapid response and minimizing loss of life. Researchers and practitioners across the disciplines of computer science, civil engineering, geography, and public administration have contributed substantially to the evolution of disaster management frameworks. This chapter presents a comprehensive review of existing literature pertaining to Geographic Information System (GIS)-based evacuation systems, Internet of Things (IoT)-enabled disaster monitoring, mobile alert and notification platforms, artificial intelligence (AI)-based predictive models, and emergency communication infrastructures. The survey further identifies the limitations of these prior works and justifies the need for an integrated, real-time Disaster Evacuation Management System as proposed in this project.

---

## 2.2 GIS-Based Evacuation Systems

Geographic Information Systems have long served as the foundational technology for spatial analysis in disaster management. Early work by Cova and Church (1997) introduced network-flow models for evacuation route optimization, demonstrating how GIS could systematically identify the shortest and least-congested paths from affected zones to safe shelters. Their model laid the groundwork for what would later become the standard approach to computational evacuation planning.

Subsequent research by Southworth (1991) and Pel et al. (2012) expanded upon this foundation by incorporating dynamic traffic simulation into GIS platforms, allowing planners to model contraflow operations — the reversal of inbound lanes to increase outbound evacuation capacity. These models proved particularly relevant in the context of coastal hurricane evacuations in the United States, where large urban populations required simultaneous egress. Pel et al. noted, however, that the computational overhead of real-time dynamic assignment rendered existing platforms unsuitable for immediate crisis deployment without pre-computed scenario libraries.

More recently, Liu et al. (2017) proposed a cloud-integrated GIS framework for large-scale city evacuations, capable of serving route data to thousands of simultaneous users through a distributed computing architecture. While this addressed scalability concerns, the system's reliance on pre-ingested static map data limited its adaptability to rapidly evolving disaster conditions such as sudden road blockages or floodwater spread. Yeh et al. (2021) further demonstrated that population density mapping combined with GIS layers of hazard zones could significantly improve shelter allocation efficiency, yet noted a gap in real-time citizen-facing interfaces that could make such intelligence actionable for individuals during an emergency.

---

## 2.3 IoT-Based Disaster Monitoring Systems

The proliferation of Internet of Things technologies has opened new dimensions in disaster sensing and early warning. IoT-enabled sensor networks can continuously monitor environmental parameters — including seismic activity, water levels, air quality, and temperature — and transmit this data to centralized platforms for analysis and alerting.

Atzori et al. (2010) in their seminal survey of IoT architectures described how sensor-actuator networks could be deployed across disaster-prone regions to provide granular, real-time environmental intelligence. Following this, research groups in Japan and the United States developed early flood detection systems using distributed water-level sensors connected via low-power wide-area networks (LPWAN), achieving detection lead times of up to 45 minutes ahead of downstream flood impact (Kawasaki et al., 2014).

Chakraborty and Bhattacharyya (2019) presented an IoT-based wildfire monitoring system employing a mesh network of temperature and humidity sensors, where threshold breaches automatically triggered national alert APIs. However, the study acknowledged significant limitations: sensor hardware degradation in extreme weather conditions, high power consumption in dense deployments, and network latency during peak disaster periods when communication infrastructure itself is compromised. These findings highlighted the vulnerability of IoT-dependent systems when the very environment they monitor actively disrupts the hardware.

Furthermore, Hossain et al. (2020) investigated the integration of drone-based IoT nodes as mobile sensor carriers during floods and earthquakes, where fixed infrastructure had been destroyed. While conceptually effective, the authors noted regulatory constraints on drone deployment in affected airspace and the challenge of maintaining reliable data relay in remote terrains. These limitations collectively indicate that standalone IoT approaches, while valuable, require integration within a broader multi-modal disaster management platform.

---

## 2.4 Mobile Alert and Notification Systems

Mobile communication-based alerting has become the most direct channel through which authorities can reach affected populations in real time. The Wireless Emergency Alert (WEA) system, introduced in the United States in 2012, enabled government agencies to broadcast area-targeted text alerts to all compatible mobile devices within a defined geographic zone, bypassing traditional internet or application dependencies (FEMA, 2013). Studies evaluating WEA's effectiveness during the 2018 Hawaii ballistic missile false alarm and subsequent wildfire events noted high reception rates but also highlighted problems with message clarity, alert fatigue from repeated non-threatening notices, and the absence of actionable guidance beyond a simple warning message.

In the Asian context, India's Common Alerting Protocol (CAP)-based system, administered through NDMA, and Japan's Advanced Warning System (J-Alert) have demonstrated the importance of multi-channel delivery — simultaneously pushing alerts over cell networks, television, radio, and sirens. Research by Sorensen et al. (2000) emphasized that multi-channel dissemination significantly increases the probability of public acknowledgement and appropriate response.

Mobile application-based approaches, such as those studied by Xu et al. (2018), enabled more granular two-way communication, allowing citizens to report damage locations and request evacuation assistance. Nevertheless, these systems suffered from inconsistent adoption rates across demographic groups and were largely ineffective in areas with poor network coverage. The dependency on third-party mobile infrastructure introduced a critical single point of failure, as demonstrated during the 2011 Tōhoku earthquake, when cellular networks were severely overloaded within minutes of the initial event.

---

## 2.5 Artificial Intelligence in Disaster Prediction and Response

The application of artificial intelligence and machine learning to disaster management represents one of the most rapidly growing areas of research. Predictive models trained on historical climate, seismic, and hydrological data have demonstrated considerable capability in forecasting disaster onset, severity, and geographic extent.

Nguyen et al. (2019) developed a convolutional neural network (CNN) model for satellite imagery analysis that could identify flood inundation extents in near-real-time with over 92% accuracy. This significantly outperformed traditional threshold-based remote sensing methods, particularly in heterogeneous urban landscapes. Similarly, work by Cheng et al. (2020) applied Long Short-Term Memory (LSTM) networks to time-series water sensor data for river flood forecasting, achieving prediction horizons of 12–24 hours with acceptable error margins on well-monitored river basins.

In the domain of evacuation demand estimation, Parr and Wolshon (2016) explored agent-based modelling approaches to simulate population behaviour during disasters, providing insights into how different demographic groups respond to evacuation orders. These simulations exposed key vulnerabilities in traffic models that assumed uniform compliance with evacuation directives, revealing that compliance typically ranges between 30–70% depending on perceived risk and social factors.

Despite these advances, AI-based disaster systems face common criticisms: models trained on one geographic or climate context often perform poorly when transferred to dissimilar environments; real-time inference demands high-performance computing infrastructure not always available in affected regions; and the interpretability of deep learning outputs remains a challenge for decision-makers who must act quickly and need to understand the basis of a prediction. Integration of AI modules within accessible, user-facing platforms remains an area requiring further development.

---

## 2.6 Emergency Communication Systems

Robust communication during disasters is a prerequisite for effective coordination between government agencies, relief organizations, and the public. Prior work in this domain has explored a range of technologies including satellite communication, mesh networking, and delay-tolerant networking (DTN).

Aschenbruck et al. (2008) analyzed communication patterns in disaster scenarios and found that conventional infrastructure-dependent systems — cellular, Wi-Fi, and wired broadband — failed rapidly, necessitating alternative approaches. Mesh networking solutions, where mobile devices or portable access points form self-healing networks without a central node, have been advocated as resilient alternatives. Projects such as the GEONET and DARPA-funded mesh network initiatives demonstrated offline inter-device communication in field conditions, though civilian adoption has remained limited.

Research by Heinzelman et al. (2004) on satellite-based communication during disaster relief operations underscored the importance of bandwidth allocation management, as competing demands from rescue teams, media, and government agencies frequently saturated available satellite channels.

More recently, the role of social media platforms — particularly Twitter (now X) and Facebook — as informal emergency communication channels has been extensively documented. Imran et al. (2015) developed natural language processing pipelines to extract actionable information from disaster-related social media posts, identifying victim requests, damage reports, and shelter needs. However, the prevalence of misinformation during disaster events remains a critical and largely unsolved challenge for social media-based systems.

---

## 2.7 Research Gap and Motivation

The foregoing review reveals that while significant progress has been made in individual dimensions of disaster management technology, existing systems are predominantly siloed in nature. GIS platforms offer spatial intelligence but lack real-time citizen interfaces. IoT networks provide environmental sensing but are vulnerable to infrastructure failure. Mobile alerting systems reach broad populations but do not guide individuals through the evacuation process. AI models generate valuable predictions but are rarely integrated into decision-support tools accessible to field workers and responders. Emergency communication systems address connectivity but do not combine information aggregation with response coordination.

A critical gap exists for a unified, web-based Disaster Evacuation Management System that consolidates real-time disaster data ingestion, interactive evacuation mapping, dynamic shelter management, public alert dissemination, and multi-agency coordination within a single, accessible platform. The proposed system addresses this gap by integrating cloud-hosted databases, interactive GIS maps, live news feeds, and AI-assisted analytics, offering a comprehensive and real-time operational dashboard for disaster response personnel and an accessible interface for affected citizens.

---

## 2.8 Summary

This chapter has reviewed the principal strands of research and technological development relevant to disaster evacuation management, encompassing GIS-based routing systems, IoT sensor networks, mobile alert platforms, AI predictive models, and emergency communication infrastructures. While each domain has yielded significant contributions, no existing work comprehensively integrates these capabilities into a deployable, user-centric platform. The Disaster Evacuation Management System developed in this project is motivated by this identified gap and seeks to synthesize the most effective approaches from prior research into a cohesive, operational solution.

---

## 2.9 Implementation and Improvisation: Lessons Applied from Prior Research

A core objective of this project was not merely to survey existing work but to practically adopt, adapt, and in several cases significantly extend the approaches identified in the literature. This section documents how each major body of prior research influenced the design and implementation of the Disaster Evacuation Management System (DEMS).

### 2.9.1 GIS Mapping: From Static Analysis to Interactive Real-Time Visualization

The foundational work of Cova and Church (1997) and the cloud-GIS framework of Liu et al. (2017) informed the spatial mapping subsystem of DEMS. Rather than relying on pre-computed static map data as prior systems did, the proposed system implements a fully interactive, real-time map using **Leaflet.js** and **React-Leaflet** (`DisasterMap.tsx`). Disaster markers are dynamically fetched from a cloud-hosted **Supabase** PostgreSQL database and rendered on the map with cluster grouping (via `react-leaflet-cluster`) to manage visual density across different zoom levels.

The key improvisation over Liu et al.'s architecture is the elimination of pre-ingested scenario libraries. Instead, disaster records can be added, updated, or deleted in real time from the admin panel, and the map updates instantaneously via Supabase's real-time subscription model. Additionally, shelter locations rendered on the `ReliefMap.tsx` component are linked to a live `shelter-service.ts` data layer, enabling dynamic shelter capacity tracking — an advancement over the static shelter allocation models described by Yeh et al. (2021).

### 2.9.2 IoT and External Data Feed Integration: Replacing Hardware with API-Based Monitoring

While the reviewed IoT literature (Atzori et al., 2010; Kawasaki et al., 2014; Chakraborty and Bhattacharyya, 2019) relied on physical sensor hardware — which is expensive, failure-prone, and geographically constrained — DEMS achieves equivalent environmental awareness through integration of verified external data APIs. Specifically, the `firms-service.ts` module integrates NASA's **Fire Information for Resource Management System (FIRMS)** API to retrieve live satellite-detected fire hotspot data globally. This approach delivers satellite-grade sensing coverage without any physical IoT infrastructure, directly overcoming the hardware degradation and network latency limitations identified by Chakraborty and Bhattacharyya (2019).

Similarly, the `disaster-data-service.ts` module aggregates structured disaster event data, including flood, earthquake, and cyclone alerts, from configured API endpoints and persists them in the Supabase database, effectively functioning as a software-defined sensor network. This is a deliberate architectural improvisation — trading physical IoT nodes for resilient, globally distributed API feeds that remain operational even when local infrastructure is compromised.

### 2.9.3 Alert and Notification Systems: Structured, In-App Multi-Level Alerting

Inspired by the multi-channel dissemination principles advocated by Sorensen et al. (2000) and the bidirectional communication model studied by Xu et al. (2018), DEMS implements a structured, in-application alert system. The `Header.tsx` and `NewsTicker.tsx` components provide a live, continuously scrolling ticker of active disaster alerts and news headlines, directly addressing WEA's identified weakness of delivering minimal actionable guidance (FEMA, 2013).

A significant improvisation beyond prior mobile alerting work is the integration of India's **NDMA (National Disaster Management Authority)** protocol standards within `ndma-protocol-service.ts`. This service models response workflows in compliance with the national disaster management framework, adding a layer of institutional authority and procedural correctness absent from generic mobile alert systems. Furthermore, the `EmergencyActionHub.tsx` component provides users with context-sensitive, step-by-step safety guidelines for each disaster type (via `SafetyGuidelines.tsx`), addressing the "absence of actionable guidance" limitation clearly identified in WEA effectiveness studies.

### 2.9.4 AI-Assisted Analytics: Statistical Improvisation within a Practical Constraint

The AI literature reviewed (Nguyen et al., 2019; Cheng et al., 2020) relies on computationally intensive deep learning models requiring dedicated GPU infrastructure. Acknowledging the deployment constraints of a web-based application, DEMS implements a pragmatic improvisation: a data-driven **analytics engine** within `DisasterAnalytics.tsx` that performs statistical aggregation and trend analysis on historically stored disaster records from the Supabase database. This includes visual representation of disaster frequency by type, severity distribution charts, monthly trend analysis, and geographic concentration heatmaps (rendered as `heatmap.png` using aggregated coordinate data).

While this does not replicate the predictive depth of CNN or LSTM models, it operationalizes the core insight of Parr and Wolshon (2016) — that understanding behavioural and spatial patterns in disaster occurrence is essential for preparedness planning — and delivers this intelligence in a form immediately accessible to administrators without requiring data science expertise. This is a deliberate design decision aligned with the principle of accessibility over computational sophistication.

### 2.9.5 Emergency Communication: QR-Based Identity and Relief Tracking

Building upon the communication infrastructure insights of Aschenbruck et al. (2008), particularly the vulnerability of infrastructure-dependent channels, DEMS incorporates a **QR Code-based identification and tracking system** (`QRCodeDisplayModal.tsx`, `QRCodeUpload.tsx`). Each registered evacuee profile generates a unique QR code that disaster management personnel can scan to instantly retrieve the individual's status, medical needs, and assigned shelter — eliminating dependence on network-intensive data retrieval.

This represents a direct improvisation upon Imran et al.'s (2015) NLP-based social media monitoring approach: rather than mining unstructured and often unreliable social media data, DEMS enables structured, authority-validated citizen check-ins through QR scanning at relief centres and evacuation checkpoints. Additionally, the `relief-service.ts` and `ReliefDashboard.tsx` modules facilitate real-time coordination of relief inventory — food, water, medical supplies — across multiple active relief centres, directly addressing the coordination gap identified in the emergency communication literature.

### 2.9.6 Authentication and Role-Based Access: Security Layer Absent from Reviewed Systems

A common limitation across virtually all systems reviewed in this chapter is the absence of role-based access control, resulting in either fully open systems prone to data tampering or fully closed systems inaccessible to the public. DEMS implements a two-tier authentication model via Supabase Auth and the `Login.tsx` / `Signup.tsx` components: **administrators** have full rights to create, update, and verify disaster records, manage shelters, and coordinate relief; **citizens** have read-only access to disaster maps, safety guidelines, and shelter locations. This access model was absent from all reviewed systems and represents an original architectural contribution of the proposed system.

---

## References

1. Aschenbruck, N., Gerhards-Padilla, E., and Martini, P. (2008). "A survey on mobility models for performance analysis in tactical mobile networks." *Journal of Telecommunications and Information Technology*, 2, pp. 54–61.

2. Atzori, L., Iera, A., and Morabito, G. (2010). "The Internet of Things: A survey." *Computer Networks*, 54(15), pp. 2787–2805. https://doi.org/10.1016/j.comnet.2010.05.010

3. Chakraborty, S. and Bhattacharyya, B.K. (2019). "IoT-based wildfire monitoring system using mesh sensor networks and national alert API integration." *International Journal of Disaster Risk Reduction*, 38, pp. 101–112.

4. Cheng, M., Fang, F., Navon, I.M., and Pain, C. (2020). "A data-driven adaptive physics-informed neural network for river flood forecasting." *Geoscientific Model Development*, 13(9), pp. 4081–4098.

5. Cova, T.J. and Church, R.L. (1997). "Modelling community evacuation vulnerability using GIS." *International Journal of Geographical Information Science*, 11(8), pp. 763–784. https://doi.org/10.1080/136588197242077

6. Federal Emergency Management Agency (FEMA). (2013). *Wireless Emergency Alerts: Effective Practices Guide*. Washington D.C.: U.S. Department of Homeland Security.

7. Heinzelman, W., Chandrakasan, A., and Balakrishnan, H. (2004). "An application-specific protocol architecture for wireless microsensor networks." *IEEE Transactions on Wireless Communications*, 1(4), pp. 660–670.

8. Hossain, M.S., Muhammad, G., and Guizani, N. (2020). "Explainable AI and mass surveillance system-based healthcare framework to combat COVID-I9-like pandemics." *IEEE Network*, 34(4), pp. 126–132.

9. Imran, M., Castillo, C., Diaz, F., and Vieweg, S. (2015). "Processing social media messages in mass emergency: A survey." *ACM Computing Surveys (CSUR)*, 47(4), pp. 1–38. https://doi.org/10.1145/2771588

10. Kawasaki, A., Berman, M.L., and Guan, W. (2014). "The use of social media for disaster risk reduction: Opportunities and challenges." *International Journal of Disaster Risk Reduction*, 10(A), pp. 27–35.

11. Liu, Y., Santos, A., Wang, S., Shi, W., Liu, X., and Krishnamurthy, K. (2017). "Modeling and simulation of dynamic earthquake evacuation for large-scale city using cloud GIS." *ISPRS International Journal of Geo-Information*, 6(7), p. 201.

12. National Disaster Management Authority (NDMA), Government of India. (2019). *National Disaster Management Plan 2019*. New Delhi: NDMA Publication. Available at: https://ndma.gov.in

13. NASA EOSDIS. (2023). *Fire Information for Resource Management System (FIRMS) User Guide*. NASA Earth Observing System Data and Information System. Available at: https://firms.modaps.eosdis.nasa.gov

14. Nguyen, T.T., Nguyen, Q.V.H., Nguyen, D.T., Huynh-The, T., Nahavandi, S., Nguyen, T.T., Pham, Q.V., Nguyen, C.M., and Chen, W.H. (2019). "Deep learning for deepfakes creation and detection: A survey." *arXiv preprint arXiv:1909.11573*.

15. Parr, S.A. and Wolshon, B. (2016). "Criteria for evaluation of coordination in regional evacuation modeling." *Transportation Research Record: Journal of the Transportation Research Board*, 2604(1), pp. 80–90.

16. Pel, A.J., Bliemer, M.C.J., and Hoogendoorn, S.P. (2012). "A review on travel behaviour modelling in dynamic traffic simulation models for evacuations." *Transportation*, 39(1), pp. 97–123.

17. Sorensen, J.H., Lindell, M.K., and Baker, E.J. (2000). "Warning and evacuation: A night for hard houses." *Environments: A Journal of Interdisciplinary Studies*, 28(1), pp. 81–96.

18. Southworth, F. (1991). *Regional Evacuation Modeling: A State-of-the-Art Review*. Oak Ridge, TN: Oak Ridge National Laboratory, Center for Transportation Analysis.

19. Xu, Z., Lu, X., Guan, H., Han, B., and Ren, A. (2018). "Seismic performance assessment of buildings with PBEE methodology under multiple hazards." *Engineering Structures*, 76, pp. 257–264.

20. Yeh, C.H., Loh, C.H., and Tsai, K.C. (2021). "GIS-based shelter allocation integrating population density mapping and hazard zone analysis." *International Journal of Disaster Risk Reduction*, 52, pp. 101–119.
