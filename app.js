/*
 * SMART on FHIR 病程脈絡總覽
 * - 取得指定病人的相關資源
 * - 以 Encounter 為核心的結構化視圖
 */

const RESOURCE_TYPES = [
    "AllergyIntolerance", "CarePlan", "CareTeam", "ClinicalImpression",
    "Condition", "DetectedIssue", "FamilyMemberHistory", "Goal",
    "Procedure", "RiskAssessment",
    "BodyStructure", "DiagnosticReport", "ImagingStudy", "Media",
    "Observation", "Specimen",
    "Immunization", "MedicationAdministration", "MedicationDispense",
    "MedicationRequest", "MedicationStatement",
    "Appointment", "AppointmentResponse", "DeviceRequest", "NutritionOrder",
    "ServiceRequest", "Task", "VisionPrescription",
    "Account", "ChargeItem", "Claim", "ClaimResponse", "Coverage",
    "CoverageEligibilityRequest", "CoverageEligibilityResponse",
    "EnrollmentRequest", "EnrollmentResponse", "ExplanationOfBenefit",
    "Invoice", "PaymentNotice", "PaymentReconciliation",
    "Encounter", "EpisodeOfCare", "Flag",
    "Composition", "DocumentManifest", "DocumentReference", "QuestionnaireResponse",
    "Communication", "CommunicationRequest", "DeviceUseStatement",
    "SupplyDelivery", "SupplyRequest"
];

const RESOURCE_LABELS = {
    Patient: "病人", Practitioner: "執業人員", Organization: "組織",
    AllergyIntolerance: "過敏", CarePlan: "照護計畫", CareTeam: "照護團隊",
    ClinicalImpression: "臨床印象", Condition: "診斷/問題", DetectedIssue: "檢測問題",
    FamilyMemberHistory: "家族史", Goal: "照護目標", Procedure: "處置/手術",
    RiskAssessment: "風險評估",
    BodyStructure: "身體結構", DiagnosticReport: "診斷報告", ImagingStudy: "影像檢查",
    Media: "媒體", Observation: "觀察結果", Specimen: "檢體",
    Immunization: "疫苗接種", MedicationAdministration: "給藥記錄",
    MedicationDispense: "配藥記錄", MedicationRequest: "用藥處方",
    MedicationStatement: "用藥聲明",
    Appointment: "預約", AppointmentResponse: "預約回應", DeviceRequest: "設備申請",
    NutritionOrder: "營養醫囑", ServiceRequest: "醫令/檢查", Task: "任務",
    VisionPrescription: "視力處方",
    Account: "帳戶", ChargeItem: "收費項目", Claim: "醫療申報",
    ClaimResponse: "申報回應", Coverage: "保險範圍",
    CoverageEligibilityRequest: "資格查詢", CoverageEligibilityResponse: "資格回應",
    EnrollmentRequest: "投保申請", EnrollmentResponse: "投保回應",
    ExplanationOfBenefit: "給付說明", Invoice: "帳單",
    PaymentNotice: "付款通知", PaymentReconciliation: "付款對帳",
    Encounter: "就醫紀錄", EpisodeOfCare: "照護事件", Flag: "標記",
    Composition: "文件組成", DocumentManifest: "文件清單",
    DocumentReference: "文件", QuestionnaireResponse: "問卷回應",
    Communication: "溝通記錄", CommunicationRequest: "溝通請求",
    DeviceUseStatement: "設備使用", SupplyDelivery: "物資交付", SupplyRequest: "物資申請"
};

const TYPE_COLORS = {
    Patient: "#1d4ed8",
    AllergyIntolerance: "#e11d48", CarePlan: "#3b82f6", CareTeam: "#0ea5e9",
    ClinicalImpression: "#8b5cf6", Condition: "#ef4444", DetectedIssue: "#dc2626",
    FamilyMemberHistory: "#f472b6", Goal: "#06b6d4", Procedure: "#a855f7",
    RiskAssessment: "#c026d3",
    BodyStructure: "#84cc16", DiagnosticReport: "#f59e0b", ImagingStudy: "#10b981",
    Media: "#14b8a6", Observation: "#14b8a6", Specimen: "#059669",
    Immunization: "#22c55e", MedicationAdministration: "#fb923c",
    MedicationDispense: "#fdba74", MedicationRequest: "#f97316",
    MedicationStatement: "#ea580c",
    Appointment: "#2563eb", AppointmentResponse: "#3b82f6", DeviceRequest: "#7c3aed",
    NutritionOrder: "#65a30d", ServiceRequest: "#8b5cf6", Task: "#6366f1",
    VisionPrescription: "#4f46e5",
    Account: "#0891b2", ChargeItem: "#0e7490", Claim: "#ec4899",
    ClaimResponse: "#db2777", Coverage: "#06b6d4",
    CoverageEligibilityRequest: "#0284c7", CoverageEligibilityResponse: "#0369a1",
    EnrollmentRequest: "#7dd3fc", EnrollmentResponse: "#38bdf8",
    ExplanationOfBenefit: "#f472b6", Invoice: "#fbbf24",
    PaymentNotice: "#fcd34d", PaymentReconciliation: "#fde047",
    Encounter: "#0ea5e9", EpisodeOfCare: "#0284c7", Flag: "#f59e0b",
    Composition: "#64748b", DocumentManifest: "#475569", DocumentReference: "#64748b",
    QuestionnaireResponse: "#6366f1",
    Communication: "#a78bfa", CommunicationRequest: "#8b5cf6",
    DeviceUseStatement: "#818cf8", SupplyDelivery: "#4ade80", SupplyRequest: "#22c55e",
    Unknown: "#94a3b8"
};

// ============================================
// 全域狀態與 DOM 參考
// ============================================

let client = null;
let patientResource = null;
let resourcesByType = {};
let selectedEncounterId = null;

const encounterView = document.getElementById("encounter-view");
const graphLoading = document.getElementById("graph-loading");
const patientCard = document.getElementById("patient-card");
const statsCard = document.getElementById("stats-card");
const detailCard = document.getElementById("detail-card");
const errorBanner = document.getElementById("error-banner");
const reloadBtn = document.getElementById("reload-btn");

reloadBtn.addEventListener("click", () => initializeApp(true));

if (typeof FHIR !== "undefined" && FHIR.oauth2) {
    FHIR.oauth2.ready()
        .then((fhirClient) => {
            client = fhirClient;
            initializeApp(false);
        })
        .catch((error) => {
            console.error("SMART on FHIR 初始化失敗:", error);
        });
} else {
    console.warn("非 SMART on FHIR 環境");
}

// ============================================
// 初始化與資料載入
// ============================================

async function initializeApp(forceReload) {
    if (!client) return;
    if (forceReload) resetUI();
    setGraphLoading(true);

    try {
        const patientId = client.patient && client.patient.id ? client.patient.id : null;
        if (!patientId) throw new Error("找不到病人識別資訊，請確認 launch context。");

        patientResource = await requestAll(`Patient/${patientId}`);
        renderPatientCard(patientResource);

        const success = await loadResourcesWithEverything(patientId);
        if (!success) await loadResourcesIndividually(patientId);

        renderStats();
        renderTimeline();
        renderClinicalSummary();
    } catch (error) {
        showError("載入資料時發生錯誤", error);
    } finally {
        setGraphLoading(false);
    }
}

async function loadResourcesWithEverything(patientId) {
    try {
        let allResources = [];
        let nextUrl = `Patient/${patientId}/$everything?_count=500`;
        let pageCount = 0;

        while (nextUrl && pageCount < 10) {
            pageCount++;
            try {
                const response = await client.request(nextUrl, { pageLimit: 0, flat: true, timeout: 60000 });
                let pageEntries = [];

                if (Array.isArray(response)) {
                    pageEntries = response;
                } else if (response && response.entry && Array.isArray(response.entry)) {
                    pageEntries = response.entry;
                }

                if (pageEntries.length > 0) {
                    allResources = allResources.concat(pageEntries);
                }

                nextUrl = null;
                if (response && response.link) {
                    const nextLink = response.link.find((link) => link.relation === "next");
                    if (nextLink && nextLink.url) nextUrl = nextLink.url;
                }
            } catch (pageError) {
                if (allResources.length > 0) break;
                throw pageError;
            }
        }

        if (allResources.length === 0) return false;

        resourcesByType = {};
        RESOURCE_TYPES.forEach((type) => { resourcesByType[type] = []; });

        allResources.forEach((item) => {
            let resource = item.resourceType ? item : (item.resource && item.resource.resourceType ? item.resource : null);
            if (resource && resource.resourceType) {
                const type = resource.resourceType;
                if (!resourcesByType[type]) resourcesByType[type] = [];
                resourcesByType[type].push(resource);
            }
        });

        return true;
    } catch (error) {
        console.error("$everything 查詢失敗:", error.message);
        return false;
    }
}

async function loadResourcesIndividually(patientId) {
    resourcesByType = {};
    const failures = [];

    const resourcePromises = RESOURCE_TYPES.map(async (type) => {
        try {
            resourcesByType[type] = await fetchResourcesForType(type, patientId);
        } catch (error) {
            resourcesByType[type] = [];
            failures.push({ type, error: error.message });
        }
    });

    await Promise.all(resourcePromises);

    if (failures.length) {
        showError("部分資源無法載入", { message: failures.map((f) => f.type).join(", ") });
    }
}

function resetUI() {
    errorBanner.style.display = "none";
    patientCard.innerHTML = '<div class="loading">載入病人資料中...</div>';
    statsCard.innerHTML = '<div class="loading">統計載入中...</div>';
    if (encounterView) encounterView.innerHTML = '<div class="loading">載入中...</div>';
    detailCard.innerHTML = '<div class="empty-state"><i class="fas fa-hand-pointer"></i>點選時間軸上的就醫事件查看詳情</div>';
}

function setGraphLoading(isLoading) {
    if (graphLoading) graphLoading.style.display = isLoading ? "flex" : "none";
}

function showError(message, error) {
    errorBanner.style.display = "block";
    errorBanner.innerHTML = `<strong>${escapeHtml(message)}</strong><div>${escapeHtml(error && error.message ? error.message : "未知錯誤")}</div>`;
}

async function requestAll(url) {
    const result = await client.request(url, { pageLimit: 0, flat: true });
    if (Array.isArray(result)) return result;
    if (result && result.resourceType) return result;
    if (result && result.entry) return result.entry.map((e) => e.resource).filter(Boolean);
    return [];
}

async function fetchResourcesForType(type, patientId) {
    const queries = buildSearchCandidates(type, patientId);
    let results = [];
    for (const query of queries) {
        try {
            const response = await requestAll(`${type}?${query}`);
            if (Array.isArray(response) && response.length) results = mergeResources(results, response);
        } catch (e) { continue; }
    }
    return results;
}

function buildSearchCandidates(type, patientId) {
    const paramSets = {
        Encounter: ["patient"], Condition: ["patient", "subject"],
        Observation: ["patient", "subject"], MedicationRequest: ["patient", "subject"],
        Procedure: ["patient", "subject"], Immunization: ["patient"],
        AllergyIntolerance: ["patient"], DiagnosticReport: ["patient", "subject"],
        CarePlan: ["patient", "subject"], ServiceRequest: ["patient", "subject"],
        QuestionnaireResponse: ["patient", "subject"], DocumentReference: ["patient", "subject"],
        ImagingStudy: ["patient"], Claim: ["patient"],
        ExplanationOfBenefit: ["patient"], Coverage: ["patient", "beneficiary"]
    };
    const params = paramSets[type] || ["patient", "subject"];
    const queries = [];
    params.forEach((param) => {
        queries.push(`${param}=${patientId}`);
        if (["patient", "subject", "beneficiary"].includes(param)) {
            queries.push(`${param}=Patient/${patientId}`);
        }
    });
    return queries.map((q) => `${q}&_count=1000`);
}

function mergeResources(current, incoming) {
    const map = new Map(current.map((item) => [`${item.resourceType}/${item.id}`, item]));
    incoming.forEach((item) => {
        if (item && item.resourceType && item.id) map.set(`${item.resourceType}/${item.id}`, item);
    });
    return Array.from(map.values());
}

// ============================================
// UI 渲染：病人卡片、統計
// ============================================

function renderPatientCard(patient) {
    if (!patient || !patient.id) {
        patientCard.innerHTML = '<div class="empty-state">找不到病人資料</div>';
        return;
    }
    const name = formatHumanName(patient.name && patient.name[0]);
    const gender = patient.gender || "未知";
    const genderIcon = gender === "male" ? "fa-mars" : gender === "female" ? "fa-venus" : "fa-circle-question";
    const birthDate = patient.birthDate || "未知";
    let age = "未知";
    if (birthDate !== "未知") {
        const today = new Date();
        const birth = new Date(birthDate);
        age = today.getFullYear() - birth.getFullYear();
        const md = today.getMonth() - birth.getMonth();
        if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
    }
    patientCard.innerHTML = `
        <div class="patient-header">
            <div class="patient-avatar"><i class="fas ${genderIcon}"></i></div>
            <div class="patient-title"><div class="patient-name">${escapeHtml(name)}</div></div>
        </div>
        <div class="patient-info">
            <div class="info-row">性別: <span class="info-value">${escapeHtml(gender)}</span></div>
            <div class="info-row">生日: <span class="info-value">${escapeHtml(birthDate)}</span></div>
            <div class="info-row">年齡: <span class="info-value">${age} 歲</span></div>
        </div>`;
}

function renderStats() {
    const totalResources = RESOURCE_TYPES.reduce((sum, type) => sum + (resourcesByType[type] || []).length, 0);
    const statsHtml = RESOURCE_TYPES.map((type) => {
        const count = (resourcesByType[type] || []).length;
        if (count === 0) return '';
        return `<div class="stat-item" style="border-color: ${TYPE_COLORS[type] || TYPE_COLORS.Unknown};">
            <div class="stat-count">${count}</div>
            <div class="stat-label">${RESOURCE_LABELS[type] || type} <span class="stat-type">${type}</span></div>
        </div>`;
    }).join("");
    statsCard.innerHTML = `<div class="stat-item stat-total"><div class="stat-count">${totalResources}</div><div class="stat-label">總資源數</div></div>${statsHtml}`;
}

// ============================================
// 時間軸
// ============================================

function syncTimelineHighlight(encNodeId) {
    document.querySelectorAll('.timeline-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.encounterId === encNodeId);
    });
    const resetBtn = document.getElementById('timeline-reset-btn');
    if (resetBtn) resetBtn.style.display = encNodeId ? '' : 'none';
}

function renderTimeline() {
    const timelineEl = document.getElementById('timeline');
    if (!timelineEl) return;

    const encounters = resourcesByType['Encounter'] || [];
    if (encounters.length === 0) {
        timelineEl.innerHTML = '<div class="timeline-empty">無就醫紀錄</div>';
        return;
    }

    const sorted = [...encounters].sort((a, b) => (a.period?.start || '').localeCompare(b.period?.start || ''));

    const classIcons = {
        'AMB': 'fa-hospital-user', 'IMP': 'fa-bed', 'EMER': 'fa-truck-medical',
        'HH': 'fa-house-medical', 'VR': 'fa-video',
        'ambulatory': 'fa-hospital-user', 'inpatient': 'fa-bed', 'emergency': 'fa-truck-medical'
    };

    const items = sorted.map((enc) => {
        const dateStr = enc.period?.start ? formatDate(enc.period.start).split(' ')[0] : '未知日期';
        const classCode = enc.class?.code || enc.class?.display || '';
        const typeText = enc.type?.[0]?.text || getCodingDisplay(enc.type?.[0]?.coding) || classCode || '就醫';
        const icon = classIcons[classCode] || 'fa-calendar-check';
        return `<div class="timeline-item" data-encounter-id="Encounter/${escapeHtml(enc.id)}" role="listitem" tabindex="0">
            <div class="timeline-dot" style="background: ${TYPE_COLORS.Encounter};"><i class="fas ${icon}"></i></div>
            <div class="timeline-content">
                <div class="timeline-date">${escapeHtml(dateStr)}</div>
                <div class="timeline-label" title="${escapeHtml(typeText)}">${escapeHtml(typeText)}</div>
            </div>
        </div>`;
    });

    timelineEl.innerHTML = items.join('<div class="timeline-connector"></div>');

    timelineEl.querySelectorAll('.timeline-item').forEach((item) => {
        const handleClick = () => {
            const encId = item.dataset.encounterId.replace('Encounter/', '');
            if (item.classList.contains('active')) {
                deselectEncounter();
            } else {
                selectEncounter(encId);
            }
        };
        item.addEventListener('click', handleClick);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
        });
    });

    const resetBtn = document.getElementById('timeline-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => deselectEncounter());
    }
}

// ============================================
// Encounter 索引
// ============================================

function buildEncounterIndex() {
    const index = {};
    RESOURCE_TYPES.forEach((type) => {
        if (type === 'Encounter') return;
        (resourcesByType[type] || []).forEach((res) => {
            const encRef = findEncounterReference(res);
            if (encRef) {
                if (!index[encRef]) index[encRef] = {};
                if (!index[encRef][type]) index[encRef][type] = [];
                index[encRef][type].push(res);
            }
        });
    });
    return index;
}

function findEncounterReference(resource) {
    const ref = resource.encounter?.reference || resource.context?.reference;
    if (ref && ref.includes('Encounter/')) {
        return ref.split('/').pop();
    }
    return null;
}

// ============================================
// Encounter 結構化視圖
// ============================================

const SECTION_CONFIG = [
    { type: 'Condition',            icon: 'fa-stethoscope',           color: '#ef4444', label: '診斷/問題' },
    { type: 'Observation',          icon: 'fa-microscope',            color: '#14b8a6', label: '檢查結果' },
    { type: 'DiagnosticReport',     icon: 'fa-file-medical',          color: '#f59e0b', label: '診斷報告' },
    { type: 'MedicationRequest',    icon: 'fa-prescription',          color: '#f97316', label: '用藥處方' },
    { type: 'MedicationStatement',  icon: 'fa-pills',                 color: '#ea580c', label: '用藥紀錄' },
    { type: 'Procedure',            icon: 'fa-syringe',               color: '#a855f7', label: '處置/手術' },
    { type: 'Immunization',         icon: 'fa-shield-virus',          color: '#22c55e', label: '疫苗接種' },
    { type: 'AllergyIntolerance',   icon: 'fa-triangle-exclamation',  color: '#e11d48', label: '過敏' },
    { type: 'CarePlan',             icon: 'fa-clipboard-list',        color: '#3b82f6', label: '照護計畫' },
    { type: 'ServiceRequest',       icon: 'fa-file-prescription',     color: '#8b5cf6', label: '醫令/檢查' },
    { type: 'ImagingStudy',         icon: 'fa-x-ray',                 color: '#10b981', label: '影像檢查' },
    { type: 'DocumentReference',    icon: 'fa-file-lines',            color: '#64748b', label: '文件' },
    { type: 'Claim',                icon: 'fa-file-invoice-dollar',   color: '#ec4899', label: '醫療申報' },
    { type: 'ExplanationOfBenefit', icon: 'fa-receipt',               color: '#f472b6', label: '給付說明' },
    { type: 'QuestionnaireResponse',icon: 'fa-clipboard-check',       color: '#6366f1', label: '問卷回應' },
];

function renderClinicalSummary() {
    if (!encounterView) return;
    selectedEncounterId = null;
    syncTimelineHighlight(null);

    const sections = [];

    // 活躍診斷
    const conditions = (resourcesByType['Condition'] || []).filter((c) => {
        const s = c.clinicalStatus?.coding?.[0]?.code;
        return s === 'active' || s === 'recurrence' || s === 'relapse';
    });
    sections.push(buildSummaryCard('活躍診斷', 'fa-heart-pulse', '#ef4444',
        conditions.length === 0 ? '<div class="summary-card-empty">無活躍診斷</div>' :
        conditions.map((c) => {
            const name = c.code?.text || getCodingDisplay(c.code?.coding) || c.id;
            const onset = c.onsetDateTime ? formatDate(c.onsetDateTime).split(' ')[0] : '';
            return `<div class="summary-list-item" data-res-type="Condition" data-res-id="${escapeHtml(c.id)}">
                <span class="summary-item-name">${escapeHtml(name)}</span>
                <span class="summary-item-value active-status">active</span>
                ${onset ? `<span class="summary-item-date">${onset}</span>` : ''}
            </div>`;
        }).join('')
    ));

    // 目前用藥
    const meds = (resourcesByType['MedicationRequest'] || []).filter((m) => m.status === 'active' || m.status === 'on-hold');
    const medSt = (resourcesByType['MedicationStatement'] || []).filter((m) => m.status === 'active');
    const allMeds = [...meds, ...medSt];
    sections.push(buildSummaryCard('目前用藥', 'fa-prescription-bottle-medical', '#f97316',
        allMeds.length === 0 ? '<div class="summary-card-empty">無目前用藥</div>' :
        allMeds.map((m) => {
            const name = m.medicationCodeableConcept?.text || getCodingDisplay(m.medicationCodeableConcept?.coding) || m.id;
            const dosage = m.dosageInstruction?.[0]?.text || m.dosage?.[0]?.text || '';
            return `<div class="summary-list-item" data-res-type="${escapeHtml(m.resourceType)}" data-res-id="${escapeHtml(m.id)}">
                <span class="summary-item-name">${escapeHtml(name)}</span>
                ${dosage ? `<span class="summary-item-value">${escapeHtml(dosage)}</span>` : ''}
            </div>`;
        }).join('')
    ));

    // 近期異常檢查值
    const abnormals = (resourcesByType['Observation'] || []).filter((obs) => {
        if (!obs.valueQuantity?.value || !obs.referenceRange?.length) return false;
        const v = obs.valueQuantity.value, r = obs.referenceRange[0];
        return (r.low?.value !== undefined && v < r.low.value) || (r.high?.value !== undefined && v > r.high.value);
    }).sort((a, b) => (b.effectiveDateTime || '').localeCompare(a.effectiveDateTime || '')).slice(0, 10);

    sections.push(buildSummaryCard('近期異常檢查值', 'fa-triangle-exclamation', '#f59e0b',
        abnormals.length === 0 ? '<div class="summary-card-empty">無異常檢查值</div>' :
        abnormals.map((obs) => {
            const name = obs.code?.text || getCodingDisplay(obs.code?.coding) || obs.id;
            const val = obs.valueQuantity ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ''}` : '';
            const d = obs.effectiveDateTime ? formatDate(obs.effectiveDateTime).split(' ')[0] : '';
            return `<div class="summary-list-item" data-res-type="Observation" data-res-id="${escapeHtml(obs.id)}">
                <span class="summary-item-name">${escapeHtml(name)}</span>
                <span class="summary-item-value abnormal">${escapeHtml(val)}</span>
                ${d ? `<span class="summary-item-date">${d}</span>` : ''}
            </div>`;
        }).join('')
    ));

    // 過敏
    const allergies = resourcesByType['AllergyIntolerance'] || [];
    if (allergies.length > 0) {
        sections.push(buildSummaryCard('已知過敏', 'fa-shield-virus', '#e11d48',
            allergies.map((a) => {
                const name = a.code?.text || getCodingDisplay(a.code?.coding) || a.id;
                return `<div class="summary-list-item" data-res-type="AllergyIntolerance" data-res-id="${escapeHtml(a.id)}">
                    <span class="summary-item-name">${escapeHtml(name)}</span>
                    ${a.criticality ? `<span class="summary-item-value">${escapeHtml(a.criticality)}</span>` : ''}
                </div>`;
            }).join('')
        ));
    }

    encounterView.innerHTML = `<div class="clinical-summary">${sections.join('')}</div>`;

    encounterView.querySelectorAll('.summary-list-item').forEach((item) => {
        item.addEventListener('click', () => showResourceDetail(item.dataset.resType, item.dataset.resId));
    });

    detailCard.innerHTML = '<div class="empty-state"><i class="fas fa-hand-pointer"></i>點選時間軸上的就醫事件，或點選摘要項目查看詳情</div>';
}

function buildSummaryCard(title, icon, color, contentHtml) {
    return `<div class="summary-card" style="border-left-color: ${color};">
        <h3><i class="fas ${icon}" style="color: ${color};"></i> ${escapeHtml(title)}</h3>
        <div class="summary-list">${contentHtml}</div>
    </div>`;
}

function selectEncounter(encounterId) {
    const encounters = resourcesByType['Encounter'] || [];
    const encounter = encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    selectedEncounterId = encounterId;
    syncTimelineHighlight(`Encounter/${encounterId}`);

    const index = buildEncounterIndex();
    const related = index[encounterId] || {};

    const typeText = encounter.type?.[0]?.text || getCodingDisplay(encounter.type?.[0]?.coding) || '就醫';
    const classCode = encounter.class?.display || encounter.class?.code || '';
    const status = encounter.status || '';
    const startDate = encounter.period?.start ? formatDate(encounter.period.start) : '';
    const endDate = encounter.period?.end ? formatDate(encounter.period.end) : '';

    let html = `<div class="encounter-detail">
        <div class="encounter-detail-header">
            <h3><i class="fas fa-calendar-check"></i> ${escapeHtml(typeText)}</h3>
            <div class="encounter-meta">
                ${status ? `<div class="encounter-meta-item"><i class="fas fa-circle-check"></i> <strong>${escapeHtml(status)}</strong></div>` : ''}
                ${classCode ? `<div class="encounter-meta-item"><i class="fas fa-hospital"></i> <strong>${escapeHtml(classCode)}</strong></div>` : ''}
                ${startDate ? `<div class="encounter-meta-item"><i class="fas fa-clock"></i> ${escapeHtml(startDate)}${endDate && endDate !== startDate ? ' ~ ' + escapeHtml(endDate) : ''}</div>` : ''}
            </div>
        </div>`;

    let totalRes = 0;

    // 已知類型
    SECTION_CONFIG.forEach(({ type, icon, color, label }) => {
        const resources = related[type] || [];
        if (resources.length === 0) return;
        totalRes += resources.length;
        html += buildEncounterSection(type, icon, color, label, resources);
    });

    // 其他類型
    Object.keys(related).forEach((type) => {
        if (SECTION_CONFIG.find((s) => s.type === type)) return;
        const resources = related[type];
        if (!resources || resources.length === 0) return;
        totalRes += resources.length;
        const label = RESOURCE_LABELS[type] || type;
        const color = TYPE_COLORS[type] || TYPE_COLORS.Unknown;
        html += buildEncounterSection(type, 'fa-file-medical', color, label, resources);
    });

    if (totalRes === 0) {
        html += '<div class="encounter-empty"><i class="fas fa-folder-open"></i> 此次就醫無關聯的醫療資源</div>';
    }

    html += '</div>';
    encounterView.innerHTML = html;

    // 綁定事件
    encounterView.querySelectorAll('.encounter-section-header').forEach((header) => {
        header.addEventListener('click', () => {
            header.nextElementSibling.classList.toggle('collapsed');
            header.querySelector('.encounter-section-toggle').classList.toggle('collapsed');
        });
    });

    encounterView.querySelectorAll('.enc-resource-card').forEach((card) => {
        card.addEventListener('click', () => {
            encounterView.querySelectorAll('.enc-resource-card').forEach((c) => c.classList.remove('active'));
            card.classList.add('active');
            showResourceDetail(card.dataset.resType, card.dataset.resId);
        });
    });

    showResourceDetail('Encounter', encounterId);
}

function deselectEncounter() {
    selectedEncounterId = null;
    renderClinicalSummary();
}

function buildEncounterSection(type, icon, color, label, resources) {
    const cardsHtml = resources.map((res) => buildEncResourceCard(res, type, color)).join('');
    return `<div class="encounter-section">
        <div class="encounter-section-header">
            <div class="encounter-section-icon" style="background: ${color}20; color: ${color};"><i class="fas ${icon}"></i></div>
            <span class="encounter-section-title">${escapeHtml(label)}</span>
            <span class="encounter-section-count">${resources.length}</span>
            <i class="fas fa-chevron-down encounter-section-toggle"></i>
        </div>
        <div class="encounter-section-body">${cardsHtml}</div>
    </div>`;
}

function buildEncResourceCard(resource, type, color) {
    const title = getResourceCardTitle(resource);
    const fields = [];

    switch (type) {
        case 'Observation':
            if (resource.valueQuantity) fields.push(`<span class="enc-card-field">測量值: <strong>${resource.valueQuantity.value} ${resource.valueQuantity.unit || ''}</strong></span>`);
            else if (resource.valueString) fields.push(`<span class="enc-card-field">值: <strong>${escapeHtml(resource.valueString)}</strong></span>`);
            else if (resource.valueCodeableConcept) fields.push(`<span class="enc-card-field">值: <strong>${escapeHtml(resource.valueCodeableConcept.text || getCodingDisplay(resource.valueCodeableConcept.coding) || '')}</strong></span>`);
            if (resource.effectiveDateTime) fields.push(`<span class="enc-card-field">${formatDate(resource.effectiveDateTime).split(' ')[0]}</span>`);
            break;
        case 'Condition':
            if (resource.clinicalStatus?.coding?.[0]?.code) fields.push(`<span class="enc-card-field">狀態: <strong>${resource.clinicalStatus.coding[0].code}</strong></span>`);
            if (resource.onsetDateTime) fields.push(`<span class="enc-card-field">發病: ${formatDate(resource.onsetDateTime).split(' ')[0]}</span>`);
            break;
        case 'MedicationRequest': case 'MedicationStatement':
            if (resource.dosageInstruction?.[0]?.text || resource.dosage?.[0]?.text) fields.push(`<span class="enc-card-field">${escapeHtml(resource.dosageInstruction?.[0]?.text || resource.dosage?.[0]?.text)}</span>`);
            break;
        case 'Procedure':
            if (resource.status) fields.push(`<span class="enc-card-field">狀態: <strong>${resource.status}</strong></span>`);
            if (resource.performedDateTime) fields.push(`<span class="enc-card-field">${formatDate(resource.performedDateTime).split(' ')[0]}</span>`);
            break;
        default:
            if (resource.status) fields.push(`<span class="enc-card-field">狀態: <strong>${resource.status}</strong></span>`);
    }

    return `<div class="enc-resource-card" data-res-type="${escapeHtml(type)}" data-res-id="${escapeHtml(resource.id)}">
        <div class="enc-card-title" style="color: ${color};">${escapeHtml(title)}</div>
        ${fields.length ? `<div class="enc-card-fields">${fields.join('')}</div>` : ''}
    </div>`;
}

// ============================================
// 右側詳情面板
// ============================================

function showResourceDetail(resType, resId) {
    if (!detailCard) return;
    let resource = (resourcesByType[resType] || []).find((r) => r.id === resId);
    if (!resource && resType === 'Patient' && patientResource?.id === resId) resource = patientResource;
    if (!resource) {
        detailCard.innerHTML = `<h3>${escapeHtml(resType)}</h3><div class="empty-state">找不到資源 ${escapeHtml(resId)}</div>`;
        return;
    }

    const label = RESOURCE_LABELS[resType] || resType;
    const summary = buildResourceSummary(resource);

    detailCard.innerHTML = `
        <h3>${escapeHtml(label)}</h3>
        <div class="detail-summary">${summary}</div>
        <div class="json-collapsible">
            <div class="json-header" tabindex="0" role="button" aria-expanded="false"><span>JSON 詳情</span><span class="collapse-icon">▼</span></div>
            <div class="json-content collapsed"><pre>${escapeHtml(JSON.stringify(resource, null, 2))}</pre></div>
        </div>`;

    const jh = detailCard.querySelector('.json-header');
    const jc = detailCard.querySelector('.json-content');
    const ci = detailCard.querySelector('.collapse-icon');
    if (jh && jc && ci) {
        const toggle = () => { const c = jc.classList.toggle('collapsed'); ci.classList.toggle('collapsed'); jh.setAttribute('aria-expanded', !c); };
        jh.addEventListener('click', toggle);
        jh.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    }
}

// ============================================
// 資源摘要建構器
// ============================================

function getResourceCardTitle(resource) {
    switch (resource.resourceType) {
        case "Observation": return resource.code?.text || getCodingDisplay(resource.code?.coding) || "觀察結果";
        case "Condition": return resource.code?.text || getCodingDisplay(resource.code?.coding) || "診斷";
        case "Procedure": return resource.code?.text || getCodingDisplay(resource.code?.coding) || "處置";
        case "MedicationStatement": case "MedicationRequest":
            return resource.medicationCodeableConcept?.text || getCodingDisplay(resource.medicationCodeableConcept?.coding) || "藥物";
        case "Encounter": return resource.type?.[0]?.text || getCodingDisplay(resource.type?.[0]?.coding) || "就醫";
        case "Patient": return formatHumanName(resource.name?.[0]) || "病人";
        case "DiagnosticReport": return resource.code?.text || getCodingDisplay(resource.code?.coding) || "診斷報告";
        case "Immunization": return resource.vaccineCode?.text || getCodingDisplay(resource.vaccineCode?.coding) || "疫苗";
        case "AllergyIntolerance": return resource.code?.text || getCodingDisplay(resource.code?.coding) || "過敏";
        case "Organization": return resource.name || "組織";
        case "Practitioner": return formatHumanName(resource.name?.[0]) || "醫護人員";
        default: return resource.code?.text || getCodingDisplay(resource.code?.coding) || resource.id || resource.resourceType;
    }
}

function buildResourceSummary(resource) {
    const rows = [];
    rows.push(`<div class="summary-row"><span>ID</span><span>${resource.id || "-"}</span></div>`);
    switch (resource.resourceType) {
        case "Observation": buildObservationSummary(resource, rows); break;
        case "Condition": buildConditionSummary(resource, rows); break;
        case "Procedure": buildProcedureSummary(resource, rows); break;
        case "Encounter": buildEncounterSummary(resource, rows); break;
        case "MedicationStatement": case "MedicationRequest": buildMedicationSummary(resource, rows); break;
        case "DiagnosticReport": buildDiagnosticReportSummary(resource, rows); break;
        case "Immunization": buildImmunizationSummary(resource, rows); break;
        case "AllergyIntolerance": buildAllergySummary(resource, rows); break;
        default: buildGenericSummary(resource, rows); break;
    }
    return rows.join("");
}

function buildObservationSummary(r, rows) {
    if (r.code) rows.push(`<div class="summary-row"><span>檢查項目</span><span>${r.code.text || getCodingDisplay(r.code.coding) || "-"}</span></div>`);
    if (r.valueQuantity) rows.push(`<div class="summary-row"><span>測量值</span><span>${r.valueQuantity.value || ""} ${r.valueQuantity.unit || ""}</span></div>`);
    else if (r.valueString) rows.push(`<div class="summary-row"><span>測量值</span><span>${r.valueString}</span></div>`);
    if (r.referenceRange?.length) {
        const rr = r.referenceRange[0]; const lo = rr.low?.value||""; const hi = rr.high?.value||""; const u = rr.low?.unit||rr.high?.unit||"";
        if (lo||hi) rows.push(`<div class="summary-row"><span>參考範圍</span><span>${lo}-${hi} ${u}</span></div>`);
    }
    if (r.status) rows.push(`<div class="summary-row"><span>狀態</span><span>${r.status}</span></div>`);
    if (r.effectiveDateTime) rows.push(`<div class="summary-row"><span>檢查時間</span><span>${formatDate(r.effectiveDateTime)}</span></div>`);
}

function buildConditionSummary(r, rows) {
    if (r.code) rows.push(`<div class="summary-row"><span>診斷名稱</span><span>${r.code.text || getCodingDisplay(r.code.coding) || "-"}</span></div>`);
    if (r.clinicalStatus) rows.push(`<div class="summary-row"><span>臨床狀態</span><span>${r.clinicalStatus.coding?.[0]?.display || r.clinicalStatus.coding?.[0]?.code || "-"}</span></div>`);
    if (r.severity) rows.push(`<div class="summary-row"><span>嚴重程度</span><span>${r.severity.text || getCodingDisplay(r.severity.coding) || "-"}</span></div>`);
    if (r.onsetDateTime) rows.push(`<div class="summary-row"><span>發病日期</span><span>${formatDate(r.onsetDateTime)}</span></div>`);
}

function buildProcedureSummary(r, rows) {
    if (r.code) rows.push(`<div class="summary-row"><span>處置名稱</span><span>${r.code.text || getCodingDisplay(r.code.coding) || "-"}</span></div>`);
    if (r.status) rows.push(`<div class="summary-row"><span>狀態</span><span>${r.status}</span></div>`);
    if (r.performedDateTime) rows.push(`<div class="summary-row"><span>執行時間</span><span>${formatDate(r.performedDateTime)}</span></div>`);
}

function buildEncounterSummary(r, rows) {
    if (r.type?.length) rows.push(`<div class="summary-row"><span>就醫類型</span><span>${r.type[0].text || getCodingDisplay(r.type[0].coding) || "-"}</span></div>`);
    if (r.status) rows.push(`<div class="summary-row"><span>狀態</span><span>${r.status}</span></div>`);
    if (r.period) rows.push(`<div class="summary-row"><span>就醫時間</span><span>${formatDate(r.period.start)}${r.period.end ? ' ~ ' + formatDate(r.period.end) : ''}</span></div>`);
    if (r.class) rows.push(`<div class="summary-row"><span>就醫分類</span><span>${r.class.display || r.class.code || "-"}</span></div>`);
}

function buildMedicationSummary(r, rows) {
    if (r.medicationCodeableConcept) rows.push(`<div class="summary-row"><span>藥品名稱</span><span>${r.medicationCodeableConcept.text || getCodingDisplay(r.medicationCodeableConcept.coding) || "-"}</span></div>`);
    if (r.status) rows.push(`<div class="summary-row"><span>狀態</span><span>${r.status}</span></div>`);
    if (r.dosageInstruction?.length) rows.push(`<div class="summary-row"><span>劑量</span><span>${r.dosageInstruction[0].text || "-"}</span></div>`);
    if (r.authoredOn) rows.push(`<div class="summary-row"><span>開立日期</span><span>${formatDate(r.authoredOn)}</span></div>`);
}

function buildDiagnosticReportSummary(r, rows) {
    if (r.code) rows.push(`<div class="summary-row"><span>報告名稱</span><span>${r.code.text || getCodingDisplay(r.code.coding) || "-"}</span></div>`);
    if (r.status) rows.push(`<div class="summary-row"><span>狀態</span><span>${r.status}</span></div>`);
    if (r.effectiveDateTime) rows.push(`<div class="summary-row"><span>報告日期</span><span>${formatDate(r.effectiveDateTime)}</span></div>`);
    if (r.conclusion) rows.push(`<div class="summary-row"><span>結論</span><span>${r.conclusion}</span></div>`);
}

function buildImmunizationSummary(r, rows) {
    if (r.vaccineCode) rows.push(`<div class="summary-row"><span>疫苗名稱</span><span>${r.vaccineCode.text || getCodingDisplay(r.vaccineCode.coding) || "-"}</span></div>`);
    if (r.status) rows.push(`<div class="summary-row"><span>狀態</span><span>${r.status}</span></div>`);
    if (r.occurrenceDateTime) rows.push(`<div class="summary-row"><span>接種日期</span><span>${formatDate(r.occurrenceDateTime)}</span></div>`);
}

function buildAllergySummary(r, rows) {
    if (r.code) rows.push(`<div class="summary-row"><span>過敏原</span><span>${r.code.text || getCodingDisplay(r.code.coding) || "-"}</span></div>`);
    if (r.clinicalStatus) rows.push(`<div class="summary-row"><span>狀態</span><span>${r.clinicalStatus.coding?.[0]?.code || "-"}</span></div>`);
    if (r.criticality) rows.push(`<div class="summary-row"><span>嚴重程度</span><span>${r.criticality}</span></div>`);
}

function buildGenericSummary(r, rows) {
    if (r.status) rows.push(`<div class="summary-row"><span>狀態</span><span>${r.status}</span></div>`);
    if (r.code) rows.push(`<div class="summary-row"><span>代碼</span><span>${r.code.text || getCodingDisplay(r.code.coding) || "-"}</span></div>`);
    if (r.effectiveDateTime) rows.push(`<div class="summary-row"><span>日期</span><span>${formatDate(r.effectiveDateTime)}</span></div>`);
}

// ============================================
// 工具函數
// ============================================

function getCodingDisplay(coding) {
    if (!coding || !coding.length) return "";
    return coding[0].display || coding[0].code || "";
}

function formatDate(dateString) {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return dateString; }
}

function formatHumanName(name) {
    if (!name) return "未知";
    if (name.text) return name.text;
    const given = name.given ? name.given.join(" ") : "";
    const family = name.family || "";
    return `${family}${given ? " " + given : ""}`.trim() || "未知";
}

function escapeHtml(value) {
    if (!value) return "";
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
