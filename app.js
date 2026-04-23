/*
 * SMART on FHIR 病人資源關聯圖
 * - 取得指定病人的相關資源
 * - 以關聯圖呈現 Patient 與資源間的關係
 */

const RESOURCE_TYPES = [
    // Core / Context
    "Organization",
    "Practitioner",
    "PractitionerRole",
    "RelatedPerson",
    "Location",

    // Clinical (临床)
    "AllergyIntolerance",
    "CarePlan",
    "CareTeam",
    "ClinicalImpression",
    "Condition",
    "DetectedIssue",
    "FamilyMemberHistory",
    "Goal",
    "Procedure",
    "RiskAssessment",
    
    // Diagnostics (诊断)
    "BodyStructure",
    "DiagnosticReport",
    "ImagingStudy",
    "Media",
    "Observation",
    "Specimen",
    
    // Medications (药物)
    "Immunization",
    "MedicationAdministration",
    "MedicationDispense",
    "MedicationRequest",
    "MedicationStatement",
    
    // Workflow (工作流)
    "Appointment",
    "AppointmentResponse",
    "DeviceRequest",
    "NutritionOrder",
    "ServiceRequest",
    "Task",
    "VisionPrescription",
    
    // Financial (财务)
    "Account",
    "ChargeItem",
    "Claim",
    "ClaimResponse",
    "Coverage",
    "CoverageEligibilityRequest",
    "CoverageEligibilityResponse",
    "EnrollmentRequest",
    "EnrollmentResponse",
    "ExplanationOfBenefit",
    "Invoice",
    "PaymentNotice",
    "PaymentReconciliation",
    
    // Administrative (行政)
    "Encounter",
    "EpisodeOfCare",
    "Flag",
    
    // Documents (文档)
    "Composition",
    "DocumentManifest",
    "DocumentReference",
    "QuestionnaireResponse",
    
    // Others (其他)
    "Communication",
    "CommunicationRequest",
    "DeviceUseStatement",
    "SupplyDelivery",
    "SupplyRequest"
];

const RESOURCE_LABELS = {
    // Core
    Patient: "病人",
    Practitioner: "執業人員",
    PractitionerRole: "執業角色",
    RelatedPerson: "相關人員",
    Organization: "組織",
    Location: "地點",
    
    // Clinical
    AllergyIntolerance: "過敏",
    CarePlan: "照護計畫",
    CareTeam: "照護團隊",
    ClinicalImpression: "臨床印象",
    Condition: "診斷/問題",
    DetectedIssue: "檢測問題",
    FamilyMemberHistory: "家族史",
    Goal: "照護目標",
    Procedure: "處置/手術",
    RiskAssessment: "風險評估",
    
    // Diagnostics
    BodyStructure: "身體結構",
    DiagnosticReport: "診斷報告",
    ImagingStudy: "影像檢查",
    Media: "媒體",
    Observation: "觀察結果",
    Specimen: "檢體",
    
    // Medications
    Immunization: "疫苗接種",
    MedicationAdministration: "給藥記錄",
    MedicationDispense: "配藥記錄",
    MedicationRequest: "用藥處方",
    MedicationStatement: "用藥聲明",
    
    // Workflow
    Appointment: "預約",
    AppointmentResponse: "預約回應",
    DeviceRequest: "設備申請",
    NutritionOrder: "營養醫囑",
    ServiceRequest: "醫令/檢查",
    Task: "任務",
    VisionPrescription: "視力處方",
    
    // Financial
    Account: "帳戶",
    ChargeItem: "收費項目",
    Claim: "醫療申報",
    ClaimResponse: "申報回應",
    Coverage: "保險範圍",
    CoverageEligibilityRequest: "資格查詢",
    CoverageEligibilityResponse: "資格回應",
    EnrollmentRequest: "投保申請",
    EnrollmentResponse: "投保回應",
    ExplanationOfBenefit: "給付說明",
    Invoice: "帳單",
    PaymentNotice: "付款通知",
    PaymentReconciliation: "付款對帳",
    
    // Administrative
    Encounter: "就醫紀錄",
    EpisodeOfCare: "照護事件",
    Flag: "標記",
    
    // Documents
    Composition: "文件組成",
    DocumentManifest: "文件清單",
    DocumentReference: "文件",
    QuestionnaireResponse: "問卷回應",
    
    // Others
    Communication: "溝通記錄",
    CommunicationRequest: "溝通請求",
    DeviceUseStatement: "設備使用",
    SupplyDelivery: "物資交付",
    SupplyRequest: "物資申請"
};

const TYPE_COLORS = {
    Patient: "#1d4ed8",
    Practitioner: "#60a5fa",
    PractitionerRole: "#3b82f6",
    RelatedPerson: "#93c5fd",
    Organization: "#fbbf24",
    Location: "#f59e0b",
    
    // Clinical
    AllergyIntolerance: "#e11d48",
    CarePlan: "#3b82f6",
    CareTeam: "#0ea5e9",
    ClinicalImpression: "#8b5cf6",
    Condition: "#ef4444",
    DetectedIssue: "#dc2626",
    FamilyMemberHistory: "#f472b6",
    Goal: "#06b6d4",
    Procedure: "#a855f7",
    RiskAssessment: "#c026d3",
    
    // Diagnostics
    BodyStructure: "#84cc16",
    DiagnosticReport: "#f59e0b",
    ImagingStudy: "#10b981",
    Media: "#14b8a6",
    Observation: "#14b8a6",
    Specimen: "#059669",
    
    // Medications
    Immunization: "#22c55e",
    MedicationAdministration: "#fb923c",
    MedicationDispense: "#fdba74",
    MedicationRequest: "#f97316",
    MedicationStatement: "#ea580c",
    
    // Workflow
    Appointment: "#2563eb",
    AppointmentResponse: "#3b82f6",
    DeviceRequest: "#7c3aed",
    NutritionOrder: "#65a30d",
    ServiceRequest: "#8b5cf6",
    Task: "#6366f1",
    VisionPrescription: "#4f46e5",
    
    // Financial
    Account: "#0891b2",
    ChargeItem: "#0e7490",
    Claim: "#ec4899",
    ClaimResponse: "#db2777",
    Coverage: "#06b6d4",
    CoverageEligibilityRequest: "#0284c7",
    CoverageEligibilityResponse: "#0369a1",
    EnrollmentRequest: "#7dd3fc",
    EnrollmentResponse: "#38bdf8",
    ExplanationOfBenefit: "#f472b6",
    Invoice: "#fbbf24",
    PaymentNotice: "#fcd34d",
    PaymentReconciliation: "#fde047",
    
    // Administrative
    Encounter: "#0ea5e9",
    EpisodeOfCare: "#0284c7",
    Flag: "#f59e0b",
    
    // Documents
    Composition: "#64748b",
    DocumentManifest: "#475569",
    DocumentReference: "#64748b",
    QuestionnaireResponse: "#6366f1",
    
    // Others
    Communication: "#a78bfa",
    CommunicationRequest: "#8b5cf6",
    DeviceUseStatement: "#818cf8",
    SupplyDelivery: "#4ade80",
    SupplyRequest: "#22c55e",
    
    Unknown: "#94a3b8"
};

const RESOURCE_GROUP_ICONS = {
    Organization: "fa-building",
    Practitioner: "fa-user-doctor",
    PractitionerRole: "fa-user-nurse",
    RelatedPerson: "fa-people-arrows",
    Location: "fa-location-dot",
    Observation: "fa-stethoscope",
    Condition: "fa-heart-pulse",
    Procedure: "fa-user-doctor",
    Encounter: "fa-hospital",
    MedicationRequest: "fa-pills",
    MedicationStatement: "fa-capsules",
    DiagnosticReport: "fa-file-waveform",
    Immunization: "fa-syringe",
    AllergyIntolerance: "fa-triangle-exclamation",
    CarePlan: "fa-notes-medical",
    Goal: "fa-bullseye",
    Claim: "fa-file-invoice-dollar",
    ExplanationOfBenefit: "fa-receipt",
    DocumentReference: "fa-folder-open",
    QuestionnaireResponse: "fa-clipboard-list",
    Appointment: "fa-calendar-check",
    Task: "fa-list-check"
};

const RESOURCE_GROUPS = RESOURCE_TYPES.reduce((groups, type) => {
    groups[type] = {
        label: RESOURCE_LABELS[type] || type,
        icon: RESOURCE_GROUP_ICONS[type] || "fa-cubes",
        color: TYPE_COLORS[type] || TYPE_COLORS.Unknown,
        types: [type]
    };
    return groups;
}, {});

const EXPANDABLE_REFERENCE_TYPES = new Set([
    ...RESOURCE_TYPES,
    "Patient",
    "Practitioner",
    "Organization",
    "Location",
    "PractitionerRole",
    "RelatedPerson",
    "CareTeam",
    "EpisodeOfCare"
]);

// ============================================
// 方案一：Resource 語意原型與關聯優先序
// ============================================

const RESOURCE_ARCHETYPES = {
    // 問題導向 (Problem): 描述臨床問題/狀況
    Condition: "problem",
    AllergyIntolerance: "problem",
    DetectedIssue: "problem",
    RiskAssessment: "problem",
    FamilyMemberHistory: "problem",
    Flag: "problem",

    // 事件導向 (Event): 描述發生過的臨床事件
    Encounter: "event",
    Procedure: "event",
    Immunization: "event",
    EpisodeOfCare: "event",
    Communication: "event",

    // 結果導向 (Result): 描述觀察/檢驗結果
    Observation: "result",
    DiagnosticReport: "result",
    ImagingStudy: "result",
    Specimen: "result",
    Media: "result",
    ClinicalImpression: "result",
    BodyStructure: "result",
    Composition: "result",
    DocumentReference: "result",
    QuestionnaireResponse: "result",

    // 行動導向 (Action): 描述計畫/醫囑/行動
    MedicationRequest: "action",
    MedicationStatement: "action",
    MedicationAdministration: "action",
    MedicationDispense: "action",
    ServiceRequest: "action",
    DeviceRequest: "action",
    NutritionOrder: "action",
    CarePlan: "action",
    CareTeam: "action",
    Goal: "action",
    Task: "action",
    Appointment: "action",
    VisionPrescription: "action",

    // 財務導向 (Financial)
    Claim: "financial",
    ClaimResponse: "financial",
    ExplanationOfBenefit: "financial",
    Coverage: "financial",
    Account: "financial",
    ChargeItem: "financial",
    Invoice: "financial",
    PaymentNotice: "financial",
    PaymentReconciliation: "financial",
    CoverageEligibilityRequest: "financial",
    CoverageEligibilityResponse: "financial",
    EnrollmentRequest: "financial",
    EnrollmentResponse: "financial"
};

const ARCHETYPE_LABELS = {
    problem: "問題導向",
    event: "事件導向",
    result: "結果導向",
    action: "行動導向",
    financial: "財務導向"
};

const RELATED_RESOURCE_PRIORITY = {
    Condition: {
        contextLabel: "診斷/問題的臨床脈絡",
        priorities: [
            { type: "Encounter", label: "相關就醫紀錄", description: "此診斷在哪些就醫中被記錄或處理" },
            { type: "Observation", label: "相關觀察結果", description: "支持或追蹤此診斷的觀察/檢驗" },
            { type: "MedicationRequest", label: "相關用藥處方", description: "針對此診斷開立的藥物" },
            { type: "Procedure", label: "相關處置", description: "因此診斷而施行的處置或手術" },
            { type: "DiagnosticReport", label: "相關診斷報告", description: "與此診斷相關的報告" },
            { type: "CarePlan", label: "相關照護計畫", description: "為管理此診斷制定的照護計畫" }
        ]
    },
    Encounter: {
        contextLabel: "就醫事件的完整脈絡",
        priorities: [
            { type: "Condition", label: "就醫診斷", description: "此次就醫中記錄的診斷" },
            { type: "Observation", label: "觀察結果", description: "此次就醫中進行的觀察/檢驗" },
            { type: "MedicationRequest", label: "用藥處方", description: "此次就醫開立的藥物" },
            { type: "Procedure", label: "處置紀錄", description: "此次就醫中施行的處置" },
            { type: "DiagnosticReport", label: "診斷報告", description: "此次就醫中產生的報告" },
            { type: "ServiceRequest", label: "醫令紀錄", description: "此次就醫中開立的醫令" }
        ]
    },
    Observation: {
        contextLabel: "觀察結果的臨床脈絡",
        priorities: [
            { type: "Encounter", label: "所屬就醫", description: "此觀察結果產生的就醫事件" },
            { type: "Condition", label: "相關診斷", description: "此觀察結果可能支持的診斷" },
            { type: "DiagnosticReport", label: "所屬報告", description: "包含此觀察結果的診斷報告" },
            { type: "ServiceRequest", label: "來源醫令", description: "觸發此觀察的醫令" },
            { type: "Observation", label: "相關觀察", description: "同一脈絡中的其他觀察結果" }
        ]
    },
    MedicationRequest: {
        contextLabel: "用藥處方的臨床脈絡",
        priorities: [
            { type: "Encounter", label: "開立就醫", description: "此處方的開立就醫事件" },
            { type: "Condition", label: "用藥適應症", description: "此處方所針對的診斷" },
            { type: "MedicationAdministration", label: "給藥記錄", description: "此處方的實際給藥情形" },
            { type: "MedicationDispense", label: "配藥記錄", description: "此處方的配藥情形" },
            { type: "Observation", label: "相關觀察", description: "用藥前後的相關觀察結果" }
        ]
    }
};

const ARCHETYPE_STORY_BLUEPRINTS = {
    problem: {
        whyTypes: ["Condition", "DetectedIssue", "AllergyIntolerance", "Observation", "DiagnosticReport", "ClinicalImpression"],
        contextTypes: ["Encounter", "Practitioner", "Organization", "EpisodeOfCare"],
        beforeTypes: ["Observation", "DiagnosticReport", "ClinicalImpression", "ServiceRequest"],
        afterTypes: ["MedicationRequest", "Procedure", "CarePlan", "Task"],
        impactTypes: ["MedicationRequest", "Procedure", "CarePlan", "Task"]
    },
    event: {
        whyTypes: ["Condition", "ServiceRequest", "CarePlan", "Observation", "DiagnosticReport"],
        contextTypes: ["Encounter", "Practitioner", "Organization", "EpisodeOfCare"],
        beforeTypes: ["Condition", "Observation", "DiagnosticReport", "ServiceRequest"],
        afterTypes: ["Observation", "DiagnosticReport", "MedicationRequest", "CarePlan", "Task", "Appointment"],
        impactTypes: ["Observation", "DiagnosticReport", "MedicationRequest", "CarePlan", "Task", "Appointment"]
    },
    result: {
        whyTypes: ["Condition", "ServiceRequest", "Encounter", "DiagnosticReport"],
        contextTypes: ["Encounter", "Practitioner", "Organization", "EpisodeOfCare"],
        beforeTypes: ["Condition", "ServiceRequest", "Observation"],
        afterTypes: ["MedicationRequest", "Procedure", "CarePlan", "DiagnosticReport"],
        impactTypes: ["Condition", "MedicationRequest", "Procedure", "CarePlan"]
    },
    action: {
        whyTypes: ["Condition", "Observation", "DiagnosticReport", "Encounter"],
        contextTypes: ["Encounter", "Practitioner", "Organization", "EpisodeOfCare"],
        beforeTypes: ["Condition", "Observation", "DiagnosticReport", "ServiceRequest"],
        afterTypes: ["MedicationAdministration", "MedicationDispense", "Observation", "Task", "CarePlan", "Appointment"],
        impactTypes: ["Observation", "Task", "CarePlan", "MedicationAdministration", "MedicationDispense"]
    },
    financial: {
        whyTypes: ["Encounter", "Procedure", "MedicationRequest", "Coverage"],
        contextTypes: ["Encounter", "Organization", "EpisodeOfCare"],
        beforeTypes: ["Procedure", "Encounter", "MedicationRequest", "Claim"],
        afterTypes: ["ClaimResponse", "ExplanationOfBenefit", "PaymentNotice", "PaymentReconciliation"],
        impactTypes: ["ClaimResponse", "ExplanationOfBenefit", "CoverageEligibilityResponse"]
    },
    unknown: {
        whyTypes: ["Condition", "Encounter", "Observation", "ServiceRequest"],
        contextTypes: ["Encounter", "Practitioner", "Organization"],
        beforeTypes: ["Condition", "Observation", "DiagnosticReport"],
        afterTypes: ["Observation", "DiagnosticReport", "Task", "CarePlan"],
        impactTypes: ["Observation", "DiagnosticReport", "Task", "CarePlan"]
    }
};

const STORY_PANEL_COPY = {
    subtitle: "從原因、情境到後續影響，閱讀這筆資料在照護流程中的位置",
    whyTitle: "為什麼出現",
    whyDescription: "先看這筆資料背後的臨床動機、依據或照護意圖。",
    contextTitle: "它屬於哪個照護情境",
    contextDescription: "了解它發生在哪次就醫、由誰處理、屬於哪段照護流程。",
    timelineTitle: "前後發生了什麼",
    timelineDescription: "把這筆資料放回前後事件脈絡，而不是只看單一欄位。",
    impactTitle: "它帶來哪些後續影響",
    impactDescription: "觀察這筆資料之後推動了哪些後續行動、結果或照護安排。"
};

let client = null;
let patientResource = null;
let resourcesByType = {};
let network = null;
let nodes = null;
let edges = null;
let nodeMeta = new Map();
let resourceMap = new Map();
let selectedNodeId = null; // 追蹤目前選中的節點
let activeGroupModalId = null;
let activeGroupModalView = "table";
let activeModalMode = "group";
let activeRelatedContext = null;
let activeGroupSummarySearch = "";
let activeGroupSummarySelectedNodeId = null;
let activeGroupSummaryExpandedIndexes = new Set();

const graphContainer = document.getElementById("graph");
const graphLoading = document.getElementById("graph-loading");
const patientCard = document.getElementById("patient-card");
const statsCard = document.getElementById("stats-card");
const filterList = document.getElementById("filter-list");
const detailCard = document.getElementById("detail-card");
const errorBanner = document.getElementById("error-banner");
const reloadBtn = document.getElementById("reload-btn");
const groupModal = document.getElementById("group-modal");
const groupModalTitle = document.getElementById("group-modal-title");
const groupModalMeta = document.getElementById("group-modal-meta");
const groupModalBody = document.getElementById("group-modal-body");
const groupModalClose = document.getElementById("group-modal-close");
const groupModalBackdrop = document.getElementById("group-modal-backdrop");

const DEFAULT_VISIBLE_GROUPS = new Set(Object.keys(RESOURCE_GROUPS));

reloadBtn.addEventListener("click", () => initializeApp(true));

if (groupModalClose) {
    groupModalClose.addEventListener("click", closeGroupModal);
}

if (groupModalBackdrop) {
    groupModalBackdrop.addEventListener("click", closeGroupModal);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && groupModal && !groupModal.hidden) {
        closeGroupModal();
    }
});

// 資源篩選收合功能（支援鍵盤導航）
const filterCollapseHeader = document.querySelector(".collapsible-header");
const filterCollapseIcon = document.getElementById("filter-collapse-icon");
const filterListContent = document.getElementById("filter-list");

if (filterCollapseHeader && filterCollapseIcon && filterListContent) {
    const toggleFilter = () => {
        const isCollapsed = filterListContent.classList.toggle("collapsed");
        filterCollapseIcon.classList.toggle("collapsed");
        // 更新 ARIA 狀態
        filterCollapseHeader.setAttribute("aria-expanded", !isCollapsed);
    };
    
    filterCollapseHeader.addEventListener("click", toggleFilter);
    
    // 鍵盤支援（Enter 或 Space 鍵）
    filterCollapseHeader.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleFilter();
        }
    });
}

// 鍵盤導航提示
document.addEventListener("DOMContentLoaded", () => {
    // 為圖表區域添加鍵盤提示
    const graphCanvas = document.getElementById("graph");
    if (graphCanvas) {
        graphCanvas.addEventListener("focus", () => {
            const hint = document.createElement("div");
            hint.className = "keyboard-hint";
            hint.setAttribute("role", "status");
            hint.setAttribute("aria-live", "polite");
            hint.textContent = "使用方向鍵移動、Enter 鍵選擇節點、Tab 鍵切換焦點";
            graphCanvas.appendChild(hint);
            
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.remove();
                }
            }, 3000);
        });
    }
});

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

async function initializeApp(forceReload) {
    if (!client) {
        return;
    }

    if (forceReload) {
        resetUI();
    }

    setGraphLoading(true);

    try {
        if (typeof vis === "undefined") {
            throw new Error("找不到 vis-network 圖形套件，請確認網路可連線或 CDN 未被阻擋。");
        }

        const patientId = client.patient && client.patient.id ? client.patient.id : null;
        if (!patientId) {
            throw new Error("找不到病人識別資訊，請確認 launch context。");
        }

        patientResource = await requestAll(`Patient/${patientId}`);
        renderPatientCard(patientResource);

        // 優先使用 $everything 方式
        const success = await loadResourcesWithEverything(patientId);
        
        if (!success) {
            await loadResourcesIndividually(patientId);
        }

        renderStats();
        renderFilters();
        buildGraph();
        
        renderInitialGroupOverview();
    } catch (error) {
        showError("載入資料時發生錯誤", error);
    } finally {
        setGraphLoading(false);
    }
}

async function loadResourcesWithEverything(patientId) {
    try {
        console.time("$everything 查詢耗時");
        
        // 使用 _count 參數控制每頁數量，允許分頁
        let allResources = [];
        let nextUrl = `Patient/${patientId}/$everything?_count=500`;
        let pageCount = 0;
        let totalEntriesReceived = 0;

        // 處理分頁
        while (nextUrl && pageCount < 10) { // 最多 10 頁，避免無限循環
            pageCount++;
            
            try {
                // 增加超時時間到 60 秒，用於大量資源
                const options = { pageLimit: 0, flat: true, timeout: 60000 };
                const response = await client.request(nextUrl, options);
                
                let pageEntries = [];
                
                // flat: true 會直接返回資源數組，而不是 Bundle 結構
                if (Array.isArray(response)) {
                    pageEntries = response;
                } else if (response && response.entry && Array.isArray(response.entry)) {
                    pageEntries = response.entry;
                } else {
                    console.warn(`第 ${pageCount} 頁返回未知結構:`, response);
                }

                if (pageEntries.length > 0) {
                    allResources = allResources.concat(pageEntries);
                    totalEntriesReceived += pageEntries.length;
                }

                // 檢查是否有下一頁
                nextUrl = null;
                if (response && response.link) {
                    const nextLink = response.link.find((link) => link.relation === "next");
                    if (nextLink && nextLink.url) {
                        nextUrl = nextLink.url;
                    }
                }
            } catch (pageError) {
                console.error(`第 ${pageCount} 頁查詢失敗:`, pageError.message);
                // 如果單頁查詢失敗但已有部分結果，繼續使用
                if (allResources.length > 0) {
                    console.warn(`已取得 ${allResources.length} 項資源，停止分頁`);
                    break;
                }
                throw pageError;
            }
        }
        
        if (allResources.length === 0) {
            console.warn("$everything 返回空結果");
            return false;
        }

        // 初始化所有資源類型
        resourcesByType = {};
        RESOURCE_TYPES.forEach((type) => {
            resourcesByType[type] = [];
        });

        // 解析資源：flat: true 返回的直接是資源對象，無需再從 entry.resource 提取
        allResources.forEach((item, index) => {
            let resource = null;
            
            // 格式1：flat: true 時返回的直接是資源對象
            if (item.resourceType) {
                resource = item;
            }
            // 格式2：未使用 flat 時，可能是 entry.resource
            else if (item.resource && item.resource.resourceType) {
                resource = item.resource;
            }
            
            if (resource && resource.resourceType) {
                const type = resource.resourceType;
                if (!resourcesByType[type]) {
                    resourcesByType[type] = [];
                }
                resourcesByType[type].push(resource);
            } else {
                if (index === 0) {
                    console.warn("無法解析第一個資源:", item);
                }
            }
        });

        const summary = Object.entries(resourcesByType)
            .filter(([, items]) => items.length > 0)
            .map(([type, items]) => `${type}: ${items.length}`)
            .join(", ");
        
        return true;
    } catch (error) {
        console.error("$everything 查詢失敗:", error.message, error);
        return false;
    }
}

async function loadResourcesIndividually(patientId) {
    resourcesByType = {};
    const failures = [];
    
    console.time("逐個查詢耗時");
    
    // 減少查詢數量：改用 100 而非 1000
    const resourcePromises = RESOURCE_TYPES.map(async (type) => {
        try {
            const result = await fetchResourcesForType(type, patientId);
            resourcesByType[type] = result;
        } catch (error) {
            resourcesByType[type] = [];
            failures.push({ type, error: error.message });
        }
    });

    await Promise.all(resourcePromises);
    console.timeEnd("逐個查詢耗時");

    if (failures.length) {
        const failureList = failures.map((item) => `${item.type}(${item.error})`).join(", ");
        showError("部分資源無法載入，已略過", { message: failureList });
    }
}

function resetUI() {
    errorBanner.style.display = "none";
    if (patientCard) {
        patientCard.innerHTML = "<div class=\"loading\">載入病人資料中...</div>";
    }
    if (statsCard) {
        statsCard.innerHTML = "<div class=\"loading\">統計載入中...</div>";
    }
    filterList.innerHTML = "";
    detailCard.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-hand-pointer"></i>
            點選節點查看資源摘要
        </div>
    `;
    closeGroupModal();
}

function setGraphLoading(isLoading) {
    graphLoading.style.display = isLoading ? "flex" : "none";
}

function showError(message, error) {
    errorBanner.style.display = "block";
    const errorText = error && error.message ? error.message : "未知錯誤";
    errorBanner.innerHTML = `
        <strong>${message}</strong>
        <div>${errorText}</div>
    `;
}

async function requestAll(url) {
    const result = await client.request(url, { pageLimit: 0, flat: true });
    if (Array.isArray(result)) {
        return result;
    }
    if (result && result.resourceType) {
        return result;
    }
    if (result && result.entry) {
        return result.entry.map((entry) => entry.resource).filter(Boolean);
    }
    return [];
}

async function fetchResourcesForType(type, patientId) {
    const queries = buildSearchCandidates(type, patientId);
    let results = [];

    if (!queries.length) {
        return results;
    }

    for (const query of queries) {
        try {
            const response = await requestAll(`${type}?${query}`);
            if (Array.isArray(response) && response.length) {
                results = mergeResources(results, response);
            }
        } catch (error) {
            continue;
        }
    }

    return results;
}

function buildSearchCandidates(type, patientId) {
    const paramSets = {
        Practitioner: [],
        PractitionerRole: [],
        RelatedPerson: [],
        Organization: [],
        Location: [],
        Encounter: ["patient"],
        Condition: ["patient", "subject"],
        Observation: ["patient", "subject"],
        MedicationRequest: ["patient", "subject"],
        Procedure: ["patient", "subject"],
        Immunization: ["patient"],
        AllergyIntolerance: ["patient"],
        DiagnosticReport: ["patient", "subject"],
        CarePlan: ["patient", "subject"],
        ServiceRequest: ["patient", "subject"],
        QuestionnaireResponse: ["patient", "subject"],
        DocumentReference: ["patient", "subject"],
        ImagingStudy: ["patient"],
        Claim: ["patient"],
        ExplanationOfBenefit: ["patient"],
        Coverage: ["patient", "beneficiary"]
    };

    const params = paramSets[type] || ["patient", "subject"];
    const queries = [];

    params.forEach((param) => {
        queries.push(`${param}=${patientId}`);
        if (param === "patient" || param === "subject" || param === "beneficiary") {
            queries.push(`${param}=Patient/${patientId}`);
        }
    });

    return queries.map((query) => `${query}&_count=1000`);
}

function mergeResources(current, incoming) {
    const map = new Map(current.map((item) => [`${item.resourceType}/${item.id}`, item]));
    incoming.forEach((item) => {
        if (item && item.resourceType && item.id) {
            map.set(`${item.resourceType}/${item.id}`, item);
        }
    });
    return Array.from(map.values());
}

function renderPatientCard(patient) {
    if (!patientCard) {
        return;
    }

    if (!patient || !patient.id) {
        patientCard.innerHTML = "<div class=\"empty-state\">找不到病人資料</div>";
        return;
    }

    const name = formatHumanName(patient.name && patient.name[0]);
    const gender = patient.gender ? patient.gender : "未知";
    const genderIcon = gender === "male" ? "fa-mars" : gender === "female" ? "fa-venus" : "fa-circle-question";
    const birthDate = patient.birthDate ? patient.birthDate : "未知";
    
    // 計算年齡
    let age = "未知";
    if (birthDate !== "未知") {
        const today = new Date();
        const birth = new Date(birthDate);
        age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
    }

    patientCard.innerHTML = `
        <div class="patient-header">
            <div class="patient-avatar">
                <i class="fas ${genderIcon}"></i>
            </div>
            <div class="patient-title">
                <div class="patient-name">${name}</div>
            </div>
        </div>
        <div class="patient-info">
            <div class="info-row">性別: <span class="info-value">${gender}</span></div>
            <div class="info-row">生日: <span class="info-value">${birthDate}</span></div>
            <div class="info-row">年齡: <span class="info-value">${age} 歲</span></div>
        </div>
    `;
}

function renderStats() {
    if (!statsCard) {
        return;
    }

    const totalResources = RESOURCE_TYPES.reduce((sum, type) => sum + (resourcesByType[type] || []).length, 0);

    const groupSummaryHtml = Object.entries(RESOURCE_GROUPS).map(([groupId, group]) => {
        const count = getGroupResources(groupId).length;
        if (!count) {
            return "";
        }
        return `
            <div class="stat-item" style="border-color: ${group.color};">
                <div class="stat-count">${count}</div>
                <div class="stat-label">${group.label}</div>
            </div>
        `;
    }).join("");

    statsCard.innerHTML = `
        <div class="stat-item stat-total">
            <div class="stat-count">${totalResources}</div>
            <div class="stat-label">總資源數</div>
        </div>
        ${groupSummaryHtml}
    `;
}

function renderFilters() {
    filterList.innerHTML = Object.entries(RESOURCE_GROUPS).map(([groupId, group]) => {
        const count = getGroupResources(groupId).length;
        const isChecked = count > 0 && DEFAULT_VISIBLE_GROUPS.has(groupId) ? "checked" : "";
        return `
            <label class="filter-item">
                <input type="checkbox" data-group="${groupId}" ${isChecked} ${count === 0 ? "disabled" : ""} />
                <span class="filter-color" style="background: ${group.color}"></span>
                <span class="filter-text">${group.label} <span class="filter-type">${count} 項</span></span>
            </label>
        `;
    }).join("");

    filterList.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
        checkbox.addEventListener("change", updateVisibility);
    });
    
    // 初始化時應用篩選
    updateVisibility();
}

/**
 * 當節點被選中時，更新篩選器以只顯示該節點及其連接節點的資源類型
 * @param {string} nodeId - 選中的節點ID
 * @param {Set} connectedNodeIds - 與該節點相連的所有節點ID
 */
function updateFiltersForNode(nodeId, connectedNodeIds) {
    if (!filterList) {
        return;
    }
    
    // 收集連接節點中的所有資源類型
    const relatedResourceTypes = new Set();
    
    connectedNodeIds.forEach((id) => {
        // 從節點ID中提取資源類型（格式: "ResourceType/id"）
        const resourceType = id.split("/")[0];
        if (resourceType) {
            relatedResourceTypes.add(resourceType);
        }
    });
    
    // 添加病人資源類型
    relatedResourceTypes.add("Patient");
    
    // 清空篩選列表
    filterList.innerHTML = "";
    
    // 只顯示相關的資源類型
    relatedResourceTypes.forEach((type) => {
        const label = document.createElement("label");
        label.className = "filter-item";
        label.innerHTML = `
            <input type="checkbox" data-type="${type}" checked />
            <span class="filter-color" style="background: ${TYPE_COLORS[type] || TYPE_COLORS.Unknown}"></span>
            <span class="filter-text">${RESOURCE_LABELS[type] || type} <span class="filter-type">${type}</span></span>
        `;
        label.querySelector("input[type=checkbox]").addEventListener("change", updateVisibilityForSelectedNode);
        filterList.appendChild(label);
    });
}

/**
 * 恢復完整的篩選器（取消節點篩選狀態）
 */
function restoreFullFilters() {
    // 重新呼叫 renderFilters() 以恢復完整的篩選面板
    renderFilters();
}

/**
 * 當節點被選中時，更新該節點對應的篩選可見性
 * 只影響已選中節點相關的資源可見性，不會改變節點隱藏狀態
 */
function updateVisibilityForSelectedNode() {
    if (!selectedNodeId || !nodes || !edges) {
        return;
    }
    
    // 獲取當前選中的資源類型
    const selectedTypes = new Set();
    filterList.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
        if (checkbox.checked) {
            selectedTypes.add(checkbox.dataset.type);
        }
    });
    
    // 找出與選中節點相連的節點
    const connectedNodeIds = new Set([selectedNodeId]);
    edges.forEach((edge) => {
        if (edge.from === selectedNodeId) {
            connectedNodeIds.add(edge.to);
        }
        if (edge.to === selectedNodeId) {
            connectedNodeIds.add(edge.from);
        }
    });
    
    // 在連接的節點中隱藏未勾選的資源類型
    connectedNodeIds.forEach((nodeId) => {
        const meta = nodeMeta.get(nodeId);
        const group = meta && meta.group ? meta.group : "Unknown";
        const shouldShow = selectedTypes.has(group);
        
        const node = nodes.get(nodeId);
        if (node) {
            nodes.update({ id: nodeId, hidden: !shouldShow });
        }
    });
    
    // 更新邊的可見性
    edges.forEach((edge) => {
        const fromNode = nodes.get(edge.from);
        const toNode = nodes.get(edge.to);
        const hidden = (fromNode && fromNode.hidden) || (toNode && toNode.hidden);
        edges.update({ id: edge.id, hidden });
    });
}

/**
 * 從 FHIR 資源中提取所有 reference 欄位
 */
function extractReferences(resource) {
    const refs = [];
    const skipFields = new Set(['resourceType', 'id', 'meta', 'text', 'contained', 'extension', 'modifierExtension']);

    const walk = (obj, fieldName) => {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) {
            obj.forEach(item => walk(item, fieldName));
            return;
        }
        if (obj.reference && typeof obj.reference === 'string') {
            const target = normalizeReference(obj.reference);
            if (target) {
                refs.push({ target, label: fieldName });
            }
            return;
        }
        for (const [key, value] of Object.entries(obj)) {
            if (skipFields.has(key)) continue;
            walk(value, key);
        }
    };

    for (const [key, value] of Object.entries(resource)) {
        if (skipFields.has(key)) continue;
        walk(value, key);
    }
    return refs;
}

/**
 * 使用真實 FHIR reference 建立資源間的關聯邊
 */
function buildRealEdges(patientNodeId) {
    const REFERENCE_DISPLAY = {
        encounter: "就醫",
        basedOn: "基於",
        reasonReference: "原因",
        result: "結果",
        performer: "執行者",
        requester: "開立者",
        recorder: "記錄者",
        asserter: "判斷者",
        managingOrganization: "管理機構",
        serviceProvider: "服務機構",
        participant: "參與者",
        location: "地點",
        partOf: "屬於",
        context: "情境",
        medicationReference: "藥品",
        focus: "焦點",
        author: "作者",
        source: "來源",
        derivedFrom: "衍生自",
        hasMember: "成員",
        individual: "人員",
        diagnosis: "診斷",
        insurance: "保險"
    };

    RESOURCE_TYPES.forEach((type) => {
        const resources = resourcesByType[type] || [];
        resources.forEach((resource) => {
            const sourceId = `${resource.resourceType}/${resource.id}`;
            if (sourceId === patientNodeId) return;

            const refs = extractReferences(resource);
            let hasSpecificConnection = false;

            refs.forEach(({ target, label }) => {
                if (!nodeMeta.has(target)) return;
                if (target === patientNodeId) return;

                const edgeLabel = REFERENCE_DISPLAY[label] || "";
                addEdge(sourceId, target, edgeLabel);
                hasSpecificConnection = true;
            });

            if (!hasSpecificConnection) {
                addEdge(patientNodeId, sourceId, "");
            }
        });
    });
}

let expandedNodes = new Set();

function buildGraph() {
    if (!graphContainer) {
        return;
    }

    nodeMeta = new Map();
    resourceMap = new Map();
    expandedNodes = new Set();

    nodes = new vis.DataSet();
    edges = new vis.DataSet();

    const patientNodeId = `Patient/${patientResource.id}`;
    indexLoadedResources();

    addGraphPatientNode(patientNodeId, patientResource);
    nodes.update({
        id: patientNodeId,
        shape: "star",
        size: 28,
        font: { color: "#ffffff", size: 16 }
    });

    Object.entries(RESOURCE_GROUPS).forEach(([groupId, config]) => {
        const groupResources = getGroupResources(groupId);
        if (!groupResources.length) {
            return;
        }
        addGraphGroupNode(groupId, config, groupResources.length);
        addEdge(patientNodeId, `Group/${groupId}`, `${groupResources.length} 項`);
    });

    const options = {
        layout: {
            improvedLayout: true
        },
        physics: {
            enabled: true,
            stabilization: {
                enabled: true,
                iterations: 50,
                fit: true,
                updateInterval: 10,
                onlyDynamicEdges: false
            },
            barnesHut: {
                gravitationalConstant: -12000,
                springLength: 180,
                springConstant: 0.04,
                damping: 0.5,
                avoidOverlap: 1
            },
            maxVelocity: 50,
            minVelocity: 0.75,
            solver: "barnesHut",
            timestep: 0.35,
            adaptiveTimestep: true
        },
        nodes: {
            shape: "dot",
            size: 24,
            font: {
                color: "#e2e8f0",
                face: "Segoe UI",
                multi: true,
                size: 14
            },
            borderWidth: 2
        },
        edges: {
            arrows: {
                to: { enabled: false, scaleFactor: 0.6 }
            },
            color: "#94a3b8",
            smooth: {
                type: "continuous"
            }
        },
        groups: buildGroupStyles()
    };

    network = new vis.Network(graphContainer, { nodes, edges }, options);

    // 監聽穩定化完成事件，自動停用物理引擎
    network.on("stabilizationIterationsDone", () => {
        network.setOptions({ physics: false });
    });

    network.once("afterDrawing", () => {
        network.fit({ animation: true });
    });

    if (nodes.length <= 1) {
        showError("目前沒有可視的資源群組", { message: "只載入到 Patient 資料。" });
    }

    network.on("selectNode", (params) => {
        const nodeId = params.nodes && params.nodes[0];
        if (nodeId) {
            selectNodeById(nodeId);
        }
    });

    network.on("deselectNode", () => {
        deselectAllNodes();
    });

    updateVisibility();
}

/**
 * 選中指定節點，顯示其關聯資源
 */
function selectNodeById(nodeId) {
    selectedNodeId = nodeId;

    const meta = nodeMeta.get(nodeId);
    if (!meta) {
        return;
    }

    if (meta.kind === "group") {
        network.focus(nodeId, { scale: 1.05, animation: true });
        renderGroupSummary(meta.groupId);
        openGroupModal(meta.groupId, "summary");
        return;
    }

    if (meta.kind === "patient") {
        renderDetail(nodeId, new Set([nodeId])).catch((err) => {
            console.error("renderDetail 失敗:", err);
        });
        return;
    }

    if (!expandedNodes.has(nodeId)) {
        expandNode(nodeId);
    }

    // 不自動展開節點與調整位置，僅顯示明細
    const connectedNodeIds = new Set([nodeId]);
    edges.forEach((edge) => {
        if (edge.from === nodeId) connectedNodeIds.add(edge.to);
        if (edge.to === nodeId) connectedNodeIds.add(edge.from);
    });

    nodes.forEach((node) => {
        nodes.update({ id: node.id, hidden: !connectedNodeIds.has(node.id) });
    });

    edges.forEach((edge) => {
        edges.update({ id: edge.id, hidden: true });
    });

    edges.forEach((edge) => {
        if (edge.from === nodeId || edge.to === nodeId) {
            edges.update({ id: edge.id, hidden: false });
        }
    });

    positionConnectedNodesForSelection(nodeId, connectedNodeIds);
    // 不隱藏其他節點與邊，僅更新篩選器與明細
    updateFiltersForNode(nodeId, connectedNodeIds);

    renderDetail(nodeId, connectedNodeIds).catch((err) => {
        console.error("renderDetail 失敗:", err);
    });
}

/**
 * 取消所有節點選擇，恢復完整視圖
 */
function deselectAllNodes() {
    selectedNodeId = null;

    restoreFullFilters();

    detailCard.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-hand-pointer"></i>
            點選節點查看資源摘要
        </div>
    `;

    renderInitialGroupOverview();
}

function renderFallbackGraph(message) {
    graphContainer.innerHTML = "";
    graphContainer.style.display = "block";

    const header = document.createElement("div");
    header.className = "fallback-title";
    header.textContent = message;
    graphContainer.appendChild(header);

    const list = document.createElement("div");
    list.className = "fallback-list";

    const items = [];
    if (patientResource && patientResource.id) {
        items.push({
            type: "Patient",
            id: patientResource.id,
            label: formatHumanName(patientResource.name?.[0])
        });
    }

    RESOURCE_TYPES.forEach((type) => {
        (resourcesByType[type] || []).forEach((resource) => {
            items.push({
                type,
                id: resource.id,
                label: getResourceDisplay(resource)
            });
        });
    });

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "fallback-card";
        const chineseLabel = RESOURCE_LABELS[item.type] || item.type;
        card.innerHTML = `
            <div class="fallback-type" style="color: ${TYPE_COLORS[item.type] || TYPE_COLORS.Unknown};">${chineseLabel}</div>
            <div class="fallback-label">${item.label || "(無標題)"}</div>
            <div class="fallback-id">${item.id || "-"}</div>
        `;
        list.appendChild(card);
    });

    graphContainer.appendChild(list);
}

function buildGroupStyles() {
    const groups = {
        Patient: {
            color: {
                background: TYPE_COLORS.Patient,
                border: "#1e3a8a",
                highlight: {
                    background: "#fbbf24",
                    border: "#f59e0b"
                }
            },
            font: {
                color: "#ffffff",
                size: 14,
                highlight: {
                    color: "#1f2937"
                }
            }
        }
    };

    RESOURCE_TYPES.forEach((type) => {
        groups[type] = {
            color: {
                background: TYPE_COLORS[type] || TYPE_COLORS.Unknown,
                border: "#ffffff",
                highlight: {
                    background: "#fbbf24",
                    border: "#f59e0b"
                }
            },
            font: {
                color: "#ffffff",
                size: 14,
                highlight: {
                    color: "#1f2937"
                }
            }
        };
    });

    groups.Unknown = {
        color: {
            background: TYPE_COLORS.Unknown,
            border: "#ffffff",
            highlight: {
                background: "#fbbf24",
                border: "#f59e0b"
            }
        },
        font: {
            color: "#ffffff",
            size: 14,
            highlight: {
                color: "#1f2937"
            }
        }
    };

    return groups;
}

function addGraphPatientNode(nodeId, resource) {
    addNode(nodeId, resource, "Patient", formatHumanName(resource.name?.[0]) || "病人");
    nodeMeta.set(nodeId, { kind: "patient", group: "Patient", distance: 0 });
}

function addGraphGroupNode(groupId, groupConfig, count) {
    const nodeId = `Group/${groupId}`;
    const label = `${groupConfig.label}\n${count} 項資源`;
    nodes.add({
        id: nodeId,
        label,
        shape: "box",
        margin: 14,
        color: {
            background: groupConfig.color,
            border: "#ffffff",
            highlight: {
                background: "#fbbf24",
                border: "#f59e0b"
            }
        },
        font: {
            color: "#ffffff",
            size: 16,
            face: "Segoe UI"
        }
    });
    nodeMeta.set(nodeId, { kind: "group", groupId, group: groupId, distance: 1 });
}

function indexLoadedResources() {
    resourceMap = new Map();
    if (patientResource && patientResource.id) {
        resourceMap.set(`Patient/${patientResource.id}`, patientResource);
    }
    RESOURCE_TYPES.forEach((type) => {
        (resourcesByType[type] || []).forEach((resource) => {
            resourceMap.set(`${resource.resourceType}/${resource.id}`, resource);
        });
    });
}

function getGroupResources(groupId) {
    const group = RESOURCE_GROUPS[groupId];
    if (!group) {
        return [];
    }

    return resourcesByType[group.types[0]] || [];
}

function addNode(nodeId, resource, group, displayText, distance = 1) {
    if (nodeMeta.has(nodeId)) {
        return false;
    }

    // 使用中文標籤作為節點的第一行
    const chineseLabel = RESOURCE_LABELS[group] || group;
    const label = `${chineseLabel}\n${displayText || nodeId}`;
    try {
        nodes.add({
            id: nodeId,
            label,
            group: group || "Unknown"
        });
    } catch (err) {
        console.error("nodes.add 失敗:", err);
        throw err;
    }

    nodeMeta.set(nodeId, { group, distance });
    if (resource && resource.resourceType) {
        resourceMap.set(nodeId, resource);
    }

    return true;
}

function addEdge(from, to, label) {
    const edgeId = `${from}--${label}-->${to}`;
    if (edges.get(edgeId)) {
        return;
    }

    edges.add({
        id: edgeId,
        from,
        to,
        label,
        font: { align: "middle", size: 10 }
    });
}

function expandNode(nodeId) {
    if (expandedNodes.has(nodeId)) {
        return false; // 已經展開過
    }
    
    expandedNodes.add(nodeId);
    const addedNodeIds = [];
    
    // 從 resourceMap 中查找該節點的資源
    const resource = resourceMap.get(nodeId);
    
    if (resource) {
        // 1. 收集並添加該資源引用的資源（正向引用）
        collectAndAddReferences(nodeId, resource, addedNodeIds);
    }
    
    // 2. 查找所有引用該節點的資源（反向引用）
    const referencingResources = findReferencingResources(nodeId);
    referencingResources.forEach(([srcNodeId, srcResource]) => {
        if (!expandedNodes.has(srcNodeId)) {
            expandedNodes.add(srcNodeId);
            const wasAdded = addNode(
                srcNodeId,
                srcResource,
                srcResource.resourceType,
                getResourceDisplay(srcResource),
                1
            );
            if (wasAdded) {
                addedNodeIds.push(srcNodeId);
            }
            collectAndAddReferences(srcNodeId, srcResource, addedNodeIds);
        }
    });

    if (addedNodeIds.length) {
        positionNewNodesAround(nodeId, addedNodeIds);
    }
    
    // 根據節點數量決定是否使用物理模擬
    const nodeCount = nodes.length;
    if (nodeCount > 100) {
        // 節點太多時禁用物理模擬，直接使用靜態布局
        if (network) {
            network.setOptions({ physics: false });
            network.redraw();
        }
    } else {
        // 節點較少時臨時啟用物理引擎進行短暫穩定化
        if (network) {
            network.setOptions({ physics: true });
            network.stabilize({ iterations: 60 });
            
            // 穩定化完成後再次停用物理引擎
            setTimeout(() => {
                network.setOptions({ physics: false });
            }, 400); // 減少等待時間到400毫秒
        }
    }
    return true;
}

function positionNewNodesAround(centerNodeId, addedNodeIds) {
    if (!network || !addedNodeIds.length) {
        return;
    }

    const centerPosition = network.getPosition(centerNodeId);
    const baseX = Number.isFinite(centerPosition?.x) ? centerPosition.x : 0;
    const baseY = Number.isFinite(centerPosition?.y) ? centerPosition.y : 0;
    const radius = Math.max(170, 42 * Math.sqrt(addedNodeIds.length));

    addedNodeIds.forEach((addedNodeId, index) => {
        const angle = (Math.PI * 2 * index) / addedNodeIds.length;
        nodes.update({
            id: addedNodeId,
            x: baseX + Math.cos(angle) * radius,
            y: baseY + Math.sin(angle) * radius
        });
    });
}

function positionConnectedNodesForSelection(centerNodeId, connectedNodeIds) {
    if (!network || !connectedNodeIds || connectedNodeIds.size <= 2) {
        return;
    }

    const centerPosition = network.getPosition(centerNodeId);
    const baseX = Number.isFinite(centerPosition?.x) ? centerPosition.x : 0;
    const baseY = Number.isFinite(centerPosition?.y) ? centerPosition.y : 0;
    const otherNodeIds = Array.from(connectedNodeIds).filter((id) => id !== centerNodeId);
    const patientNodeIds = otherNodeIds.filter((id) => id.startsWith("Patient/"));
    const nonPatientNodeIds = otherNodeIds.filter((id) => !id.startsWith("Patient/"));

    patientNodeIds.forEach((patientNodeId, index) => {
        const patientOffsetY = patientNodeIds.length > 1 ? (index - (patientNodeIds.length - 1) / 2) * 90 : 0;
        nodes.update({
            id: patientNodeId,
            x: baseX - 220,
            y: baseY + patientOffsetY
        });
    });

    const firstRingCapacity = 5;
    const arcStart = -Math.PI / 3;
    const arcEnd = Math.PI / 3;

    nonPatientNodeIds.forEach((relatedNodeId, index) => {
        const ringIndex = Math.floor(index / firstRingCapacity);
        const ringOffset = index % firstRingCapacity;
        const nodesInRing = Math.min(firstRingCapacity, nonPatientNodeIds.length - ringIndex * firstRingCapacity);
        const radius = 190 + ringIndex * 110;
        const angle = nodesInRing === 1
            ? 0
            : arcStart + ((arcEnd - arcStart) * ringOffset) / (nodesInRing - 1);

        nodes.update({
            id: relatedNodeId,
            x: baseX + Math.cos(angle) * radius,
            y: baseY + Math.sin(angle) * radius
        });
    });

    network.setOptions({ physics: true });
    network.stabilize({ iterations: 45 });
    setTimeout(() => {
        network.setOptions({ physics: false });
    }, 250);
}

function findReferencingResources(targetNodeId) {
    const results = [];
    
    // 遍歷所有已載入的資源
    RESOURCE_TYPES.forEach((type) => {
        const resources = resourcesByType[type] || [];
        resources.forEach((resource) => {
            const nodeId = `${resource.resourceType}/${resource.id}`;
            
            // 檢查該資源是否引用目標節點
            if (resourceReferences(resource, targetNodeId)) {
                results.push([nodeId, resource]);
            }
        });
    });
    
    return results;
}

function resourceReferences(resource, targetNodeId) {
    const references = new Set();
    
    const walk = (value) => {
        if (!value) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }
        if (typeof value === "object") {
            if (value.reference && typeof value.reference === "string") {
                const normalized = normalizeReference(value.reference);
                if (normalized) {
                    references.add(normalized);
                }
            }
            Object.values(value).forEach(walk);
        }
    };
    
    walk(resource);
    return references.has(targetNodeId);
}

function collectAndAddReferences(sourceNodeId, resource, addedNodeIds = []) {
    const references = new Set();

    const walk = (value) => {
        if (!value) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }
        if (typeof value === "object") {
            if (value.reference && typeof value.reference === "string") {
                references.add(value.reference);
            }
            Object.values(value).forEach(walk);
        }
    };

    walk(resource);

    references.forEach((ref) => {
        const normalized = normalizeReference(ref);
        if (!shouldMaterializeReferenceNode(normalized)) {
            return;
        }
        const [type, id] = normalized.split("/");
        const label = id ? id : normalized;
        const wasAdded = addNode(normalized, null, type || "Unknown", label, 2);
        if (wasAdded) {
            addedNodeIds.push(normalized);
        }
        addEdge(sourceNodeId, normalized, "subject");
    });
}

function shouldMaterializeReferenceNode(normalizedReference) {
    if (!normalizedReference || !normalizedReference.includes("/")) {
        return false;
    }

    if (resourceMap.has(normalizedReference)) {
        return true;
    }

    const [resourceType, resourceId] = normalizedReference.split("/");
    if (!resourceType || !resourceId) {
        return false;
    }

    return EXPANDABLE_REFERENCE_TYPES.has(resourceType);
}

function removeDanglingNode(nodeId) {
    if (!nodeId || !nodes || !edges) {
        return;
    }

    const edgeIdsToRemove = [];
    edges.forEach((edge) => {
        if (edge.from === nodeId || edge.to === nodeId) {
            edgeIdsToRemove.push(edge.id);
        }
    });

    if (edgeIdsToRemove.length) {
        edges.remove(edgeIdsToRemove);
    }

    if (nodes.get(nodeId)) {
        nodes.remove(nodeId);
    }

    nodeMeta.delete(nodeId);
    resourceMap.delete(nodeId);
    expandedNodes.delete(nodeId);

    if (selectedNodeId === nodeId) {
        selectedNodeId = null;
    }
}

function normalizeReference(reference) {
    if (!reference || reference.startsWith("#")) {
        return null;
    }

    if (reference.startsWith("urn:uuid:")) {
        return reference.replace("urn:uuid:", "");
    }

    if (reference.includes("/")) {
        const parts = reference.split("/").filter(Boolean);
        if (reference.startsWith("http")) {
            const lastTwo = parts.slice(-2);
            return lastTwo.join("/");
        }
        return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    }

    return reference;
}

function getResourceDisplay(resource) {
    if (!resource) {
        return "";
    }
    if (resource.code?.text) return resource.code.text;
    if (resource.code?.coding?.[0]?.display) return resource.code.coding[0].display;
    if (resource.type?.[0]?.text) return resource.type[0].text;
    if (resource.type?.[0]?.coding?.[0]?.display) return resource.type[0].coding[0].display;
    if (resource.medicationCodeableConcept?.text) return resource.medicationCodeableConcept.text;
    if (resource.vaccineCode?.text) return resource.vaccineCode.text;
    if (resource.name && typeof resource.name === 'string') return resource.name;
    if (resource.name?.[0]) return formatHumanName(resource.name[0]);
    return resource.id || resource.resourceType;
}

function getCodingDisplay(coding) {
    if (!coding || !coding.length) {
        return "";
    }
    return coding[0].display || coding[0].code || "";
}

function getResourceArchetype(resourceType) {
    return RESOURCE_ARCHETYPES[resourceType] || "unknown";
}

function getStoryBlueprint(resourceType) {
    const archetype = getResourceArchetype(resourceType);
    return ARCHETYPE_STORY_BLUEPRINTS[archetype] || ARCHETYPE_STORY_BLUEPRINTS.unknown;
}

function mergeResourceLists(...lists) {
    const map = new Map();

    lists.flat().forEach((resource) => {
        if (!resource || !resource.id || !resource.resourceType) {
            return;
        }
        map.set(`${resource.resourceType}/${resource.id}`, resource);
    });

    return Array.from(map.values());
}

function getReferenceDisplayValue(value) {
    if (!value) {
        return "";
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            const display = getReferenceDisplayValue(item);
            if (display) {
                return display;
            }
        }
        return "";
    }
    if (typeof value === "string") {
        return value;
    }
    if (value.text) {
        return value.text;
    }
    if (value.display) {
        return value.display;
    }
    if (value.reference) {
        return value.reference;
    }
    if (value.code) {
        return value.code;
    }
    if (value.coding && value.coding.length) {
        return getCodingDisplay(value.coding);
    }
    if (value.value) {
        return String(value.value);
    }
    return "";
}

function getCodeableConceptDisplay(concept) {
    if (!concept) {
        return "";
    }
    if (Array.isArray(concept)) {
        for (const item of concept) {
            const display = getCodeableConceptDisplay(item);
            if (display) {
                return display;
            }
        }
        return "";
    }
    return concept.text || getCodingDisplay(concept.coding) || "";
}

function getReferenceTitle(referenceValue) {
    if (!referenceValue) {
        return "";
    }

    if (Array.isArray(referenceValue)) {
        return referenceValue
            .map((item) => getReferenceTitle(item))
            .filter(Boolean)
            .join("、");
    }

    if (typeof referenceValue === "string") {
        const normalized = normalizeReference(referenceValue);
        if (normalized && resourceMap.has(normalized)) {
            return getResourceCardTitle(resourceMap.get(normalized));
        }
        return referenceValue;
    }

    if (referenceValue.display) {
        return referenceValue.display;
    }

    if (referenceValue.reference) {
        const normalized = normalizeReference(referenceValue.reference);
        if (normalized && resourceMap.has(normalized)) {
            return getResourceCardTitle(resourceMap.get(normalized));
        }
        return referenceValue.reference;
    }

    return getReferenceDisplayValue(referenceValue);
}

function getTelecomValue(resource, system) {
    return resource?.telecom?.find((item) => item.system === system)?.value || "";
}

function formatAddress(address) {
    if (!address) {
        return "";
    }

    return [
        ...(Array.isArray(address.line) ? address.line : []),
        address.city,
        address.state,
        address.postalCode,
        address.country
    ].filter(Boolean).join(", ");
}

function formatPeriodRange(period) {
    if (!period) {
        return "";
    }

    const start = formatDate(period.start);
    const end = formatDate(period.end);
    if (start !== "-" && end !== "-") {
        return `${start} ~ ${end}`;
    }
    if (start !== "-") {
        return start;
    }
    if (end !== "-") {
        return end;
    }
    return "";
}

function formatMoney(money) {
    if (!money) {
        return "";
    }
    const value = money.value !== undefined && money.value !== null ? money.value : "";
    const currency = money.currency || "";
    return `${value} ${currency}`.trim();
}

function getMedicationDisplay(resource) {
    return resource?.medicationCodeableConcept?.text
        || getCodingDisplay(resource?.medicationCodeableConcept?.coding)
        || getCodeableConceptDisplay(resource?.medication?.concept)
        || getReferenceTitle(resource?.medicationReference)
        || getReferenceTitle(resource?.medication)
        || "";
}

function calculateAge(birthDate) {
    if (!birthDate) {
        return "";
    }

    const today = new Date();
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) {
        return "";
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age >= 0 ? `${age} 歲` : "";
}

function pushSummaryRow(rows, label, value) {
    if (!value && value !== 0 && value !== false) {
        return;
    }
    rows.push(`<div class="summary-row"><span>${escapeHtml(label)}</span><span>${escapeHtml(String(value))}</span></div>`);
}

function pushCountRow(rows, label, collection) {
    if (!collection || !collection.length) {
        return;
    }
    pushSummaryRow(rows, label, `${collection.length} 項`);
}

function collectStoryFacts(resource) {
    const facts = [];
    const pushFact = (label, value) => {
        if (!value || value === "-" || value === "無日期") {
            return;
        }
        facts.push({ label, value });
    };

    pushFact("資源類型", RESOURCE_LABELS[resource.resourceType] || resource.resourceType);
    pushFact("狀態", getResourceStatus(resource));
    pushFact("主要時間", getDisplayDate(resource));

    switch (resource.resourceType) {
        case "Patient":
            pushFact("姓名", formatHumanName(resource.name?.[0]));
            pushFact("性別", resource.gender);
            pushFact("生日", resource.birthDate);
            break;
        case "Condition":
            pushFact("核心主題", resource.code?.text || getCodingDisplay(resource.code?.coding));
            pushFact("發病日期", formatDate(resource.onsetDateTime || resource.onsetPeriod?.start));
            break;
        case "Observation":
            pushFact("核心主題", resource.code?.text || getCodingDisplay(resource.code?.coding));
            pushFact("結果", resource.valueQuantity ? `${resource.valueQuantity.value || ""} ${resource.valueQuantity.unit || ""}`.trim() : resource.valueString || resource.valueCodeableConcept?.text || getCodingDisplay(resource.valueCodeableConcept?.coding));
            break;
        case "Procedure":
            pushFact("核心主題", resource.code?.text || getCodingDisplay(resource.code?.coding));
            pushFact("所屬就醫", getReferenceDisplayValue(resource.encounter));
            pushFact("類別", resource.category?.text || getCodingDisplay(resource.category?.coding));
            break;
        case "Encounter":
            pushFact("核心主題", resource.type?.[0]?.text || getCodingDisplay(resource.type?.[0]?.coding));
            pushFact("就醫分類", resource.class?.display || resource.class?.code);
            break;
        case "MedicationRequest":
        case "MedicationStatement":
            pushFact("核心主題", resource.medicationCodeableConcept?.text || getCodingDisplay(resource.medicationCodeableConcept?.coding));
            pushFact("劑量", resource.dosage?.[0]?.text);
            break;
        case "DiagnosticReport":
            pushFact("核心主題", resource.code?.text || getCodingDisplay(resource.code?.coding));
            pushFact("結論", resource.conclusion);
            break;
        default:
            pushFact("核心主題", getResourceCardTitle(resource));
            break;
    }

    pushFact("識別碼", resource.id);
    return facts.slice(0, 6);
}

function buildStoryLead(resource) {
    if (resource.resourceType === "Patient") {
        return `${formatHumanName(resource.name?.[0])} 是目前故事閱讀的核心病人，後續所有 Resource 都會圍繞此病人的照護旅程展開。`;
    }

    const title = getResourceCardTitle(resource);
    const archetypeLabel = ARCHETYPE_LABELS[getResourceArchetype(resource.resourceType)] || "醫療";
    const date = getDisplayDate(resource);
    const status = getResourceStatus(resource);
    const encounter = getReferenceDisplayValue(resource.encounter);
    const reason = getReferenceDisplayValue(resource.reasonReference) || getReferenceDisplayValue(resource.reasonCode) || getReferenceDisplayValue(resource.basedOn) || getReferenceDisplayValue(resource.focus);

    let sentence = `${title} 是一筆${archetypeLabel}資料`;
    if (date) {
        sentence += `，時間為 ${date}`;
    }
    if (status) {
        sentence += `，目前狀態為 ${status}`;
    }
    if (encounter) {
        sentence += `，並與 ${encounter} 的照護情境相關`;
    } else if (reason) {
        sentence += `，與 ${reason} 有直接關聯`;
    }
    return `${sentence}。`;
}

function buildStoryHero(resource) {
    const facts = collectStoryFacts(resource).map(({ label, value }) => `
        <div class="story-fact-card">
            <span class="story-fact-label">${escapeHtml(label)}</span>
            <strong class="story-fact-value">${escapeHtml(value)}</strong>
        </div>
    `).join("");

    const archetype = getResourceArchetype(resource.resourceType);
    const label = RESOURCE_LABELS[resource.resourceType] || resource.resourceType;

    return `
        <div class="story-hero">
            <div class="story-heading">
                <span class="story-kicker">事件故事</span>
                <h3>${escapeHtml(getResourceCardTitle(resource))}</h3>
                <p class="story-subtitle">${STORY_PANEL_COPY.subtitle}</p>
            </div>
            <div class="story-hero-meta">
                <span class="story-type-chip">${escapeHtml(label)}</span>
                <span class="archetype-badge archetype-${archetype}">${ARCHETYPE_LABELS[archetype] || "未分類"}</span>
            </div>
            <div class="story-overview-card">
                <h4>這是什麼</h4>
                <p class="story-lead">${escapeHtml(buildStoryLead(resource))}</p>
                <div class="story-fact-grid">
                    ${facts}
                </div>
            </div>
        </div>
    `;
}

function buildStoryResourceItems(resources, emptyText) {
    if (!resources.length) {
        return `<div class="story-empty">${emptyText}</div>`;
    }

    const items = resources.slice(0, 6).map((resource) => {
        const nodeId = `${resource.resourceType}/${resource.id}`;
        const color = TYPE_COLORS[resource.resourceType] || TYPE_COLORS.Unknown;
        const status = getResourceStatus(resource);
        const date = getDisplayDate(resource) || "無日期";
        return `
            <button type="button" class="story-resource-item" data-node-id="${escapeHtml(nodeId)}">
                <span class="story-resource-dot" style="background:${color};"></span>
                <span class="story-resource-body">
                    <span class="story-resource-title">${escapeHtml(getResourceCardTitle(resource))}</span>
                    <span class="story-resource-meta">${escapeHtml(RESOURCE_LABELS[resource.resourceType] || resource.resourceType)} · ${escapeHtml(date)}${status ? ` · ${escapeHtml(status)}` : ""}</span>
                </span>
            </button>
        `;
    }).join("");

    return `
        <div class="story-item-list">
            ${items}
        </div>
        ${resources.length > 6 ? `<div class="story-more">還有 ${resources.length - 6} 項相關資料</div>` : ""}
    `;
}

function buildStorySection(title, description, resources, emptyText) {
    return `
        <section class="story-section-card">
            <div class="story-section-head">
                <h4>${title}</h4>
                <p>${description}</p>
            </div>
            ${buildStoryResourceItems(resources, emptyText)}
        </section>
    `;
}

function buildStoryTimelineSection(resource, connectedResources, blueprint) {
    const currentDate = getResourceDate(resource);
    const beforeCandidates = connectedResources.filter((item) => blueprint.beforeTypes.includes(item.resourceType));
    const afterCandidates = connectedResources.filter((item) => blueprint.afterTypes.includes(item.resourceType));

    let before = [];
    let after = [];

    if (currentDate) {
        const currentTime = new Date(currentDate).getTime();
        before = beforeCandidates.filter((item) => {
            const date = getResourceDate(item);
            return date && new Date(date).getTime() <= currentTime;
        });
        after = afterCandidates.filter((item) => {
            const date = getResourceDate(item);
            return date && new Date(date).getTime() >= currentTime;
        });
    }

    if (!before.length) {
        before = beforeCandidates;
    }
    if (!after.length) {
        after = afterCandidates;
    }

    return `
        <section class="story-section-card">
            <div class="story-section-head">
                <h4>${STORY_PANEL_COPY.timelineTitle}</h4>
                <p>${STORY_PANEL_COPY.timelineDescription}</p>
            </div>
            <div class="story-timeline-grid">
                <div class="story-subsection">
                    <h5>事件之前</h5>
                    <p>在這筆資料出現前，可能已有檢查、判斷或醫令作為依據。</p>
                    ${buildStoryResourceItems(sortResourcesByDate(before), "目前沒有足夠資料串起事件之前的依據")}
                </div>
                <div class="story-subsection">
                    <h5>事件之後</h5>
                    <p>這筆資料之後，可能推動新的觀察、報告、用藥或照護安排。</p>
                    ${buildStoryResourceItems(sortResourcesByDate(after), "目前沒有足夠資料串起事件之後的影響")}
                </div>
            </div>
        </section>
    `;
}

function getConnectedResources(currentNodeId, connectedNodeIds) {
    if (!connectedNodeIds) {
        return [];
    }

    const resources = [];
    connectedNodeIds.forEach((nodeId) => {
        if (nodeId === currentNodeId) {
            return;
        }
        const resource = resourceMap.get(nodeId);
        if (resource && resource.id && resource.resourceType) {
            resources.push(resource);
        }
    });

    return sortResourcesByDate(mergeResourceLists(resources));
}

async function hydrateConnectedResources(connectedNodeIds) {
    if (!client || !connectedNodeIds) {
        return;
    }

    const missingResources = [];
    connectedNodeIds.forEach((nodeId) => {
        if (resourceMap.get(nodeId)) {
            return;
        }
        const [resType, resId] = nodeId.split("/");
        if (resType && resId) {
            missingResources.push({ nodeId, resType, resId });
        }
    });

    if (!missingResources.length) {
        return;
    }

    await Promise.allSettled(
        missingResources.map(async ({ nodeId, resType, resId }) => {
            try {
                const loadedResource = await requestAll(`${resType}/${resId}`);
                const resource = Array.isArray(loadedResource) ? loadedResource[0] : loadedResource;
                if (resource && resource.resourceType) {
                    resourceMap.set(nodeId, resource);
                }
            } catch (error) {
                console.warn(`無法補載故事資源 ${nodeId}:`, error.message);
            }
        })
    );
}

function buildResourceStory(resource, connectedResources) {
    const blueprint = getStoryBlueprint(resource.resourceType);
    const storyWhyTypes = RELATED_RESOURCE_PRIORITY[resource.resourceType]?.priorities?.map((item) => item.type) || blueprint.whyTypes;

    const whyResources = sortResourcesByDate(mergeResourceLists(
        connectedResources.filter((item) => storyWhyTypes.includes(item.resourceType)),
        ...storyWhyTypes.map((type) => findRelatedByType(resource, type))
    ));

    const contextResources = sortResourcesByDate(mergeResourceLists(
        connectedResources.filter((item) => blueprint.contextTypes.includes(item.resourceType)),
        ...blueprint.contextTypes.map((type) => findRelatedByType(resource, type))
    ));

    const impactResources = sortResourcesByDate(mergeResourceLists(
        connectedResources.filter((item) => blueprint.impactTypes.includes(item.resourceType)),
        ...blueprint.impactTypes.map((type) => findRelatedByType(resource, type))
    ));

    return `
        <div class="story-panel">
            ${buildStoryHero(resource)}
            ${buildStorySection(STORY_PANEL_COPY.whyTitle, STORY_PANEL_COPY.whyDescription, whyResources, "目前找不到這筆資料的明確臨床動機或依據")}
            ${buildStorySection(STORY_PANEL_COPY.contextTitle, STORY_PANEL_COPY.contextDescription, contextResources, "目前找不到完整的照護情境資訊")}
            ${buildStoryTimelineSection(resource, connectedResources, blueprint)}
            ${buildStorySection(STORY_PANEL_COPY.impactTitle, STORY_PANEL_COPY.impactDescription, impactResources, "目前沒有找到明確的後續影響")}
        </div>
    `;
}

function buildCompactDetailPanel(resource, relatedResources) {
    const relatedCount = relatedResources.length;
    const resourceLabel = RESOURCE_LABELS[resource.resourceType] || resource.resourceType;
    const resourceStatus = getResourceStatus(resource);
    const resourceDate = getDisplayDate(resource);
    const actionButtonHtml = `
        <div class="detail-action-bar detail-action-bar-top">
            <button class="primary-btn" id="open-related-modal-action" type="button" ${relatedCount ? "" : "disabled"}>
                <i class="fas fa-table-list" aria-hidden="true"></i> 查看相關 Resource${relatedCount ? ` (${relatedCount})` : ""}
            </button>
        </div>
    `;

    return `
        <div class="resource-detail-panel">
            <div class="resource-detail-header">
                <h3>${escapeHtml(getResourceCardTitle(resource))}</h3>
                <div class="resource-detail-meta">
                    <span class="story-type-chip">${escapeHtml(resourceLabel)}</span>
                    ${resourceStatus ? `<span class="story-type-chip">${escapeHtml(resourceStatus)}</span>` : ""}
                    ${resourceDate ? `<span class="story-type-chip">${escapeHtml(resourceDate)}</span>` : ""}
                </div>
            </div>
            ${actionButtonHtml}
            <div class="story-overview-card">
                <h4>重點資訊</h4>
                <div class="detail-summary">
                    ${buildResourceSummary(resource)}
                </div>
            </div>
        </div>
    `;
}

function buildRelatedFilterChips(filterTypes, selectedTypes) {
    const selectedTypeSet = new Set(selectedTypes || []);
    const allSelected = !selectedTypeSet.size || selectedTypeSet.size === filterTypes.length;

    return `
        <div class="related-filter-chips" role="group" aria-label="ResourceType 篩選">
            <button type="button" class="related-filter-chip ${allSelected ? "active" : ""}" data-filter-type="all">全部</button>
            ${filterTypes.map((type) => `
                <button type="button" class="related-filter-chip ${selectedTypeSet.has(type) ? "active" : ""}" data-filter-type="${escapeHtml(type)}">${escapeHtml(type)}</button>
            `).join("")}
        </div>
    `;
}

function getDirectReferenceLabels(resource) {
    const labelMap = new Map();

    extractReferences(resource).forEach(({ target, label }) => {
        if (!labelMap.has(target)) {
            labelMap.set(target, new Set());
        }
        labelMap.get(target).add(label);
    });

    return labelMap;
}

function getReverseReferenceLabels(sourceNodeId, resource) {
    return new Set(
        extractReferences(resource)
            .filter(({ target }) => target === sourceNodeId)
            .map(({ label }) => label)
    );
}

function getRelatedGroupDefinitions(resourceType) {
    const baseDefinitions = {
        subject: { id: "subject", title: "關聯對象", description: "直接對應的病人、對象或主要受益者" },
        context: { id: "context", title: "所屬脈絡", description: "和這筆資料同一照護情境、就醫或流程的資料" },
        people: { id: "people", title: "人員與機構", description: "參與、開立、管理或執行的醫護與機構" },
        findings: { id: "findings", title: "診斷與臨床依據", description: "與此資料相關的診斷、問題、原因與證據" },
        reports: { id: "reports", title: "檢查、結果與報告", description: "觀察結果、診斷報告與支持性資料" },
        actions: { id: "actions", title: "處置、醫囑與後續行動", description: "由此資料衍生或相關的醫囑、處置與照護安排" },
        financial: { id: "financial", title: "財務與保險", description: "與申報、保險、給付或帳務相關的資料" },
        locations: { id: "locations", title: "地點與服務場域", description: "和此資料直接相關的位置或服務場域" },
        documents: { id: "documents", title: "文件與溝通", description: "與此資料有關的文件、問卷與溝通紀錄" },
        other: { id: "other", title: "其他相關資料", description: "其他有關聯但不屬於上述分類的資源" }
    };

    switch (resourceType) {
        case "Encounter":
            return [
                { ...baseDefinitions.subject, title: "就診對象", description: "這次就醫直接對應的病人或照護對象" },
                { ...baseDefinitions.people, title: "參與人員與機構", description: "直接參與或承接這次就醫的醫護與機構" },
                { ...baseDefinitions.findings, title: "診斷與原因", description: "這次就醫所記錄的診斷、主訴或醫療原因" },
                { ...baseDefinitions.reports, title: "檢查與報告", description: "在這次就醫中產生的觀察、檢驗與診斷報告" },
                { ...baseDefinitions.actions, title: "處置與醫囑", description: "在這次就醫中執行或開立的處置、用藥與醫令" },
                { ...baseDefinitions.financial, title: "行政與保險", description: "這次就醫衍生的申報、保險或行政資料" },
                { ...baseDefinitions.locations, title: "就醫地點", description: "與這次就醫直接相關的位置或場域" },
                baseDefinitions.other
            ];
        case "Patient":
            return [
                { ...baseDefinitions.context, title: "就醫與照護歷程", description: "此病人的就醫紀錄、照護事件與整體脈絡" },
                { ...baseDefinitions.findings, title: "診斷與問題", description: "此病人的診斷、過敏、風險與臨床問題" },
                { ...baseDefinitions.reports, title: "檢查與報告", description: "此病人的觀察結果、檢驗與診斷報告" },
                { ...baseDefinitions.actions, title: "處置與用藥", description: "此病人的處置、用藥、醫囑與照護計畫" },
                { ...baseDefinitions.people, title: "醫護與機構", description: "與此病人直接相關的醫護人員與機構" },
                { ...baseDefinitions.financial, title: "財務與保險", description: "此病人的保險、申報、帳務與給付資料" },
                { ...baseDefinitions.documents, title: "文件與問卷", description: "病人相關的文件、問卷與溝通紀錄" },
                baseDefinitions.other
            ];
        case "Observation":
            return [
                { ...baseDefinitions.context, title: "所屬就醫與情境", description: "這筆觀察所屬的就醫、流程或照護情境" },
                { ...baseDefinitions.findings, title: "相關診斷與依據", description: "和這筆觀察互相支撐的診斷、原因與臨床依據" },
                { ...baseDefinitions.reports, title: "結果來源與相關報告", description: "和此觀察同層級或上層的結果、面板與報告" },
                { ...baseDefinitions.actions, title: "後續處置與醫囑", description: "這筆觀察後續引出的處置、用藥與醫令" },
                { ...baseDefinitions.people, title: "執行人員與機構", description: "執行、判讀或管理這筆觀察的人員與機構" },
                { ...baseDefinitions.financial, title: "財務與行政", description: "和此觀察相關的申報、帳務或保險資料" },
                baseDefinitions.other
            ];
        case "Condition":
            return [
                { ...baseDefinitions.context, title: "所屬就醫與情境", description: "這筆診斷或問題所處的就醫與照護脈絡" },
                { ...baseDefinitions.findings, title: "問題本體與臨床依據", description: "與此診斷直接相關的原因、症狀、證據與其他問題" },
                { ...baseDefinitions.reports, title: "檢查與報告", description: "支持、追蹤或說明此診斷的觀察與報告" },
                { ...baseDefinitions.actions, title: "處置與用藥", description: "針對此診斷採取的處置、醫令與用藥" },
                { ...baseDefinitions.people, title: "醫護與機構", description: "對此問題進行記錄、處理或管理的人員與機構" },
                { ...baseDefinitions.financial, title: "財務與保險", description: "和此問題相關的申報、給付或保險資料" },
                baseDefinitions.other
            ];
        case "Procedure":
            return [
                { ...baseDefinitions.context, title: "所屬就醫與脈絡", description: "這項處置所在的就醫、照護流程與上下文" },
                { ...baseDefinitions.findings, title: "處置原因與診斷", description: "促成此處置的診斷、原因與臨床依據" },
                { ...baseDefinitions.people, title: "執行人員與地點", description: "執行、參與或承接此處置的人員、機構與場域" },
                { ...baseDefinitions.reports, title: "相關檢查與報告", description: "與此處置相關的結果、報告與後續觀察" },
                { ...baseDefinitions.actions, title: "後續醫囑與照護", description: "此處置後續帶出的醫囑、用藥與照護安排" },
                { ...baseDefinitions.financial, title: "財務與保險", description: "和此處置相關的申報、帳務或保險資料" },
                baseDefinitions.other
            ];
        case "MedicationRequest":
        case "MedicationStatement":
            return [
                { ...baseDefinitions.context, title: "開立脈絡", description: "這筆用藥所在的就醫、照護情境與工作流程" },
                { ...baseDefinitions.findings, title: "用藥原因與診斷", description: "支持此用藥的診斷、問題與臨床依據" },
                { ...baseDefinitions.people, title: "開立者與執行單位", description: "開立、管理、配發或執行用藥的人員與機構" },
                { ...baseDefinitions.actions, title: "給藥與後續處置", description: "與此用藥相關的給藥、配藥與後續照護動作" },
                { ...baseDefinitions.reports, title: "相關檢查與報告", description: "與此用藥有關的檢查結果、監測資料與報告" },
                { ...baseDefinitions.financial, title: "保險與財務", description: "與此用藥有關的保險、申報與帳務資訊" },
                baseDefinitions.other
            ];
        case "DiagnosticReport":
            return [
                { ...baseDefinitions.context, title: "報告所屬情境", description: "此報告所屬的就醫事件、照護流程與請求來源" },
                { ...baseDefinitions.reports, title: "報告結果與觀察", description: "報告內或與報告直接相關的觀察結果與支援資料" },
                { ...baseDefinitions.findings, title: "臨床結論與診斷", description: "此報告的結論、判讀與臨床問題脈絡" },
                { ...baseDefinitions.people, title: "判讀人員與機構", description: "執行、出具與判讀此報告的人員與機構" },
                { ...baseDefinitions.actions, title: "後續醫囑與處置", description: "由此報告結果帶出的醫令、處置與照護安排" },
                { ...baseDefinitions.documents, title: "文件與附件", description: "此報告相關的文件、影像與附件資料" },
                baseDefinitions.other
            ];
        case "Claim":
        case "ExplanationOfBenefit":
            return [
                { ...baseDefinitions.subject, title: "申報對象", description: "這筆財務資料直接對應的病人、受益者或主體" },
                { ...baseDefinitions.context, title: "就醫與臨床脈絡", description: "這筆申報所連結的就醫、診斷、醫令與照護情境" },
                { ...baseDefinitions.people, title: "承辦人員與機構", description: "負責提供、申報、審核或支付的人員與機構" },
                { ...baseDefinitions.actions, title: "申報項目與服務內容", description: "這筆申報所對應的處置、用藥、服務與項目內容" },
                { ...baseDefinitions.financial, title: "保險、支付與審核", description: "與此資料相關的保險、支付、給付與申報結果" },
                baseDefinitions.other
            ];
        default:
            return [
                baseDefinitions.subject,
                baseDefinitions.context,
                baseDefinitions.people,
                baseDefinitions.findings,
                baseDefinitions.reports,
                baseDefinitions.actions,
                baseDefinitions.financial,
                baseDefinitions.documents,
                baseDefinitions.locations,
                baseDefinitions.other
            ];
    }
}

function buildEncounterRelatedGroups(sourceResource, resources) {
    const sourceNodeId = `${sourceResource.resourceType}/${sourceResource.id}`;
    const directLabelMap = getDirectReferenceLabels(sourceResource);
    const groupDefinitions = getRelatedGroupDefinitions(sourceResource.resourceType);

    const groups = groupDefinitions.map((definition) => ({ ...definition, resources: [] }));
    const groupMap = new Map(groups.map((group) => [group.id, group]));

    const typeGroups = {
        subject: new Set(["Patient", "Group"]),
        context: new Set(["Encounter", "EpisodeOfCare", "Appointment", "Flag"]),
        people: new Set(["Practitioner", "PractitionerRole", "Organization", "CareTeam", "RelatedPerson"]),
        findings: new Set(["Condition", "AllergyIntolerance", "DetectedIssue", "ClinicalImpression", "RiskAssessment", "FamilyMemberHistory"]),
        reports: new Set(["Observation", "DiagnosticReport", "Specimen", "ImagingStudy", "BodyStructure", "Media"]),
        actions: new Set(["Procedure", "MedicationRequest", "MedicationStatement", "MedicationAdministration", "MedicationDispense", "ServiceRequest", "CarePlan", "Immunization", "Task", "DeviceRequest", "SupplyRequest", "CommunicationRequest", "Communication"]),
        financial: new Set(["Claim", "ExplanationOfBenefit", "Coverage", "Account", "ClaimResponse", "Invoice", "ChargeItem", "PaymentNotice", "PaymentReconciliation", "CoverageEligibilityRequest", "CoverageEligibilityResponse", "EnrollmentRequest", "EnrollmentResponse"]),
        documents: new Set(["DocumentReference", "Composition", "QuestionnaireResponse"]),
        locations: new Set(["Location"])
    };

    const labelToGroupId = {
        subject: "subject",
        patient: "subject",
        beneficiary: "subject",
        subscriber: "subject",
        individual: "people",
        participant: "people",
        performer: "people",
        requester: "people",
        recorder: "people",
        asserter: "people",
        author: "people",
        resultsInterpreter: "people",
        enterer: "people",
        provider: "people",
        serviceProvider: "people",
        managingOrganization: "people",
        generalPractitioner: "people",
        insurer: "financial",
        payee: "financial",
        encounter: "context",
        context: "context",
        episodeOfCare: "context",
        appointment: "context",
        basedOn: "context",
        partOf: "context",
        condition: "findings",
        diagnosis: "findings",
        reasonReference: "findings",
        reason: "findings",
        focus: "findings",
        evidence: "findings",
        result: "reports",
        report: "reports",
        derivedFrom: "reports",
        hasMember: "reports",
        conclusionCode: "reports",
        supportingInfo: "reports",
        procedure: "actions",
        request: "actions",
        prescription: "actions",
        originalPrescription: "actions",
        followUp: "actions",
        recommendation: "actions",
        medication: "actions",
        medicationReference: "actions",
        used: "actions",
        insurance: "financial",
        coverage: "financial",
        account: "financial",
        claim: "financial",
        claimResponse: "financial",
        payment: "financial",
        location: "locations",
        facility: "locations",
        destination: "locations",
        origin: "locations",
        form: "documents",
        communication: "documents"
    };

    const resolveGroupId = (resource) => {
        const nodeId = `${resource.resourceType}/${resource.id}`;
        const directLabels = directLabelMap.get(nodeId) || new Set();
        const reverseLabels = getReverseReferenceLabels(sourceNodeId, resource);

        for (const label of directLabels) {
            const match = labelToGroupId[label];
            if (match && groupMap.has(match)) {
                return match;
            }
        }

        for (const label of reverseLabels) {
            const match = labelToGroupId[label];
            if (match && groupMap.has(match)) {
                return match;
            }
        }

        for (const [groupId, types] of Object.entries(typeGroups)) {
            if (types.has(resource.resourceType) && groupMap.has(groupId)) {
                return groupId;
            }
        }

        return "other";
    };

    resources.forEach((resource) => {
        const groupId = resolveGroupId(resource);
        const targetGroup = groupMap.get(groupId) || groupMap.get("other");
        targetGroup.resources.push(resource);
    });

    return groups.filter((group) => group.resources.length > 0);
}

function buildEncounterRelatedListView(groups, selectedNodeId) {
    if (!groups.length) {
        return '<div class="empty-state">找不到符合條件的相關 Resource</div>';
    }

    return `
        <div class="related-group-list">
            ${groups.map((group) => `
                <section class="related-group-section">
                    <div class="related-group-header">
                        <div>
                            <h4>${escapeHtml(group.title)}</h4>
                            <p>${escapeHtml(group.description)}</p>
                        </div>
                        <span class="related-group-count">${group.resources.length}</span>
                    </div>
                    <div class="related-group-items">
                        ${group.resources.map((resource) => {
                            const nodeId = `${resource.resourceType}/${resource.id}`;
                            const isActive = nodeId === selectedNodeId ? "active" : "";
                            const dateText = getDisplayDate(resource) || "無日期";
                            const statusText = getResourceStatus(resource) || "未標示狀態";
                            return `
                                <button type="button" class="related-group-item ${isActive}" data-resource-id="${escapeHtml(nodeId)}">
                                    <span class="related-group-item-main">
                                        <span class="related-group-item-title">${escapeHtml(getResourceCardTitle(resource))}</span>
                                        <span class="related-group-item-meta">${escapeHtml(resource.resourceType || "-")} · ${escapeHtml(dateText)} · ${escapeHtml(statusText)}</span>
                                    </span>
                                    <span class="related-group-item-id">${escapeHtml(`ID:${resource.id || "-"}`)}</span>
                                </button>
                            `;
                        }).join("")}
                    </div>
                </section>
            `).join("")}
        </div>
    `;
}

function buildRelatedTableView(resources, selectedNodeId) {
    if (!resources.length) {
        return '<div class="empty-state">找不到相關 Resource</div>';
    }

    const rows = resources.map((resource) => {
        const nodeId = `${resource.resourceType}/${resource.id}`;
        const isActive = nodeId === selectedNodeId ? "active" : "";
        return `
            <tr class="group-table-row related-table-row ${isActive}" data-resource-id="${nodeId}" tabindex="0">
                <td>${escapeHtml(getDisplayDate(resource) || "-")}</td>
                <td>${escapeHtml(getResourceCardTitle(resource))}</td>
                <td>${escapeHtml(resource.resourceType || "-")}</td>
                <td>${escapeHtml(getResourceStatus(resource) || "-")}</td>
                <td>${escapeHtml(resource.id || "-")}</td>
            </tr>
        `;
    }).join("");

    return `
        <div class="group-table-wrap">
            <table class="group-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>標題</th>
                        <th>ResourceType</th>
                        <th>狀態</th>
                        <th>ID</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function buildRelatedResourceDetail(resource, options = {}) {
    const emptyText = options.emptyText || "請從左側選擇一筆相關 Resource";
    const buttonId = options.buttonId || "related-detail-open-resource";

    if (!resource) {
        return `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
    }

    const nodeId = `${resource.resourceType}/${resource.id}`;
    return `
        <div class="related-detail-panel">
            <div class="related-detail-header">
                <span class="resource-detail-kicker">單筆明細</span>
                <h3>${escapeHtml(getResourceCardTitle(resource))}</h3>
                <div class="resource-detail-meta">
                    <span class="story-type-chip">${escapeHtml(resource.resourceType || "-")}</span>
                    ${getResourceStatus(resource) ? `<span class="story-type-chip">${escapeHtml(getResourceStatus(resource))}</span>` : ""}
                </div>
            </div>
            <div class="story-overview-card">
                <h4>重點資訊</h4>
                <div class="detail-summary">
                    ${buildResourceSummary(resource)}
                </div>
            </div>
            <div class="detail-action-bar">
                <button class="primary-btn" id="${escapeHtml(buttonId)}" type="button" data-node-id="${escapeHtml(nodeId)}">
                    <i class="fas fa-diagram-project" aria-hidden="true"></i> 查看相關 Resource
                </button>
            </div>
        </div>
    `;
}

async function openRelatedResourceModal(currentNodeId, connectedNodeIds, view = "table") {
    if (!groupModal || !groupModalBody || !groupModalTitle || !groupModalMeta) {
        return;
    }

    await hydrateConnectedResources(connectedNodeIds);
    const resources = getConnectedResources(currentNodeId, connectedNodeIds);

    activeModalMode = "related";
    activeGroupModalView = "table";
    activeRelatedContext = {
        sourceNodeId: currentNodeId,
        resources,
        selectedTypes: [],
        selectedNodeId: resources[0] ? `${resources[0].resourceType}/${resources[0].id}` : null
    };

    groupModal.hidden = false;
    document.body.classList.add("modal-open");
    renderGroupModal();
}

function focusResourceNodeInGraph(targetNodeId) {
    if (!targetNodeId) {
        return;
    }

    ensureResourceNodeInGraph(targetNodeId);

    if (network && nodes && nodes.get(targetNodeId)) {
        network.selectNodes([targetNodeId]);
        network.focus(targetNodeId, { scale: 1.2, animation: true });
    }

    selectNodeById(targetNodeId);
}

function ensureResourceNodeInGraph(targetNodeId) {
    if (!targetNodeId || !nodes || nodes.get(targetNodeId)) {
        return Boolean(targetNodeId);
    }

    const resource = resourceMap.get(targetNodeId);
    if (!resource || !resource.resourceType) {
        return false;
    }

    addNode(targetNodeId, resource, resource.resourceType, getResourceDisplay(resource), 1);
    expandNode(targetNodeId);

    let hasConnections = false;
    edges.forEach((edge) => {
        if (edge.from === targetNodeId || edge.to === targetNodeId) {
            hasConnections = true;
        }
    });

    if (!hasConnections && patientResource?.id) {
        addEdge(`Patient/${patientResource.id}`, targetNodeId, "");
    }

    return true;
}

function openResourceStory(targetNodeId) {
    if (!targetNodeId) {
        return;
    }

    ensureResourceNodeInGraph(targetNodeId);

    if (network && nodes && nodes.get(targetNodeId)) {
        focusResourceNodeInGraph(targetNodeId);
        return;
    }

    const connectedNodeIds = new Set([targetNodeId]);
    if (edges) {
        edges.forEach((edge) => {
            if (edge.from === targetNodeId) connectedNodeIds.add(edge.to);
            if (edge.to === targetNodeId) connectedNodeIds.add(edge.from);
        });
    }

    renderDetail(targetNodeId, connectedNodeIds).catch((err) => {
        console.error("renderDetail 失敗:", err);
    });
}

function updateVisibility() {
    // 安全检查：确保必要的 DOM 和数据结构存在
    if (!filterList || !nodes || !edges) {
        return;
    }
    
    const selectedGroups = new Set();
    filterList.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
        if (checkbox.checked) {
            selectedGroups.add(checkbox.dataset.group);
        }
    });

    nodes.forEach((node) => {
        const meta = nodeMeta.get(node.id);
        if (meta && meta.kind === "patient") {
            nodes.update({ id: node.id, hidden: false });
            return;
        }

        if (!selectedNodeId) {
            const isGroupNode = meta && meta.kind === "group";
            if (!isGroupNode) {
                nodes.update({ id: node.id, hidden: true });
                return;
            }
        }

        const group = meta && meta.group ? meta.group : "Unknown";
        const shouldShow = selectedGroups.has(group);
        nodes.update({ id: node.id, hidden: !shouldShow });
    });

    edges.forEach((edge) => {
        const fromNode = nodes.get(edge.from);
        const toNode = nodes.get(edge.to);
        const hidden = (fromNode && fromNode.hidden) || (toNode && toNode.hidden);
        edges.update({ id: edge.id, hidden });
    });
}

// ============================================
// 方案一：語意脈絡 — 按 Resource Archetype 顯示關聯
// ============================================

/**
 * 找出與指定資源有直接 reference 關聯的特定類型資源
 * 雙向查詢：正向 (resource → target) 與反向 (target → resource)
 */
function findRelatedByType(resource, targetType) {
    const nodeId = `${resource.resourceType}/${resource.id}`;
    const seen = new Set();
    const results = [];

    // 1. 正向：此資源引用的 targetType 資源
    const refs = extractReferences(resource);
    refs.forEach(({ target }) => {
        if (target.startsWith(`${targetType}/`) && !seen.has(target)) {
            seen.add(target);
            const res = resourceMap.get(target);
            if (res) results.push(res);
        }
    });

    // 2. 反向：targetType 資源中引用此資源的
    const targetResources = resourcesByType[targetType] || [];
    targetResources.forEach((targetRes) => {
        const targetNodeId = `${targetRes.resourceType}/${targetRes.id}`;
        if (seen.has(targetNodeId)) return;

        if (resourceReferences(targetRes, nodeId)) {
            seen.add(targetNodeId);
            results.push(targetRes);
        }
    });

    // 3. 間接關聯：透過共同 Encounter 連結
    if (targetType !== "Encounter" && resource.resourceType !== "Encounter") {
        const encounterRefs = refs
            .filter(({ target }) => target.startsWith("Encounter/"))
            .map(({ target }) => target);

        if (encounterRefs.length > 0) {
            targetResources.forEach((targetRes) => {
                const targetNodeId = `${targetRes.resourceType}/${targetRes.id}`;
                if (seen.has(targetNodeId)) return;

                const targetRefs = extractReferences(targetRes);
                const sharesEncounter = targetRefs.some(({ target }) =>
                    encounterRefs.includes(target)
                );
                if (sharesEncounter) {
                    seen.add(targetNodeId);
                    results.push(targetRes);
                }
            });
        }
    }

    return sortResourcesByDate(results);
}

/**
 * 建構語意脈絡區塊 — 根據 Resource Archetype 顯示優先關聯資源
 */
function buildSemanticContext(resource) {
    const resType = resource.resourceType;
    const config = RELATED_RESOURCE_PRIORITY[resType];
    if (!config) return "";

    const sections = [];

    config.priorities.forEach(({ type, label, description }) => {
        const related = findRelatedByType(resource, type);
        if (!related.length) return;

        const color = TYPE_COLORS[type] || TYPE_COLORS.Unknown;
        const icon = RESOURCE_GROUP_ICONS[type] || "fa-cubes";

        const items = related.slice(0, 8).map((r) => {
            const rNodeId = `${r.resourceType}/${r.id}`;
            const dateStr = getDisplayDate(r) || "無日期";
            const statusStr = getResourceStatus(r);
            return `
                <button type="button" class="semantic-resource-item" data-node-id="${escapeHtml(rNodeId)}">
                    <span class="semantic-item-dot" style="background:${color}"></span>
                    <span class="semantic-item-body">
                        <span class="semantic-item-title">${escapeHtml(getResourceCardTitle(r))}</span>
                        <span class="semantic-item-meta">${escapeHtml(dateStr)}${statusStr ? " · " + escapeHtml(statusStr) : ""}</span>
                    </span>
                </button>
            `;
        }).join("");

        sections.push(`
            <div class="semantic-section">
                <div class="semantic-section-header">
                    <i class="fas ${icon}" style="color:${color}" aria-hidden="true"></i>
                    <span class="semantic-section-title">${label}</span>
                    <span class="semantic-section-count">${related.length}</span>
                </div>
                <div class="semantic-section-desc">${description}</div>
                <div class="semantic-section-items">
                    ${items}
                    ${related.length > 8 ? `<div class="semantic-more">還有 ${related.length - 8} 項...</div>` : ""}
                </div>
            </div>
        `);
    });

    if (!sections.length) return "";

    const archetype = RESOURCE_ARCHETYPES[resType] || "unknown";

    return `
        <div class="semantic-context">
            <div class="semantic-context-header">
                <h4><i class="fas fa-diagram-project" aria-hidden="true"></i> ${config.contextLabel}</h4>
                <span class="archetype-badge archetype-${archetype}">${ARCHETYPE_LABELS[archetype] || archetype}</span>
            </div>
            <div class="semantic-sections">
                ${sections.join("")}
            </div>
        </div>
    `;
}

async function renderDetail(nodeId, connectedNodeIds) {
    let resource = resourceMap.get(nodeId);

    if (!resource) {
        // 在節點上標記加載狀態
        if (nodes && nodes.get(nodeId)) {
            nodes.update({ 
                id: nodeId, 
                borderWidth: 3,
                color: {
                    border: '#fbbf24',
                    background: nodes.get(nodeId).color?.background || '#94a3b8'
                }
            });
        }
        
        // 嘗試從 FHIR 伺服器加載引用資源
        detailCard.innerHTML = `
            <h3>${nodeId}</h3>
            <div class="loading-container">
                <div class="spinner-wrapper">
                    <i class="fas fa-spinner spinner-icon"></i>
                    <div class="spinner-text">LOADING...</div>
                </div>
                <p class="loading-message">正在加載引用資源...</p>
            </div>
        `;
        
        try {
            // 解析節點 ID（例如 "Observation/OBS-001"）
            const [resType, resId] = nodeId.split("/");
            if (resType && resId && client) {
                const loadedResource = await requestAll(`${resType}/${resId}`);
                if (loadedResource) {
                    // 將加載的資源存入 resourceMap
                    resource = Array.isArray(loadedResource) ? loadedResource[0] : loadedResource;
                    if (resource && resource.resourceType) {
                        resourceMap.set(nodeId, resource);
                        
                        // 移除節點的加載標記
                        if (nodes && nodes.get(nodeId)) {
                            const originalNode = nodes.get(nodeId);
                            nodes.update({ 
                                id: nodeId, 
                                borderWidth: 2,
                                color: {
                                    border: '#ffffff',
                                    background: originalNode.color?.background || '#94a3b8'
                                }
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.warn(`加載引用資源失敗 (${nodeId}):`, error.message);
            // 加載失敗時移除加載標記
            if (nodes && nodes.get(nodeId)) {
                const originalNode = nodes.get(nodeId);
                nodes.update({ 
                    id: nodeId, 
                    borderWidth: 2,
                    color: {
                        border: '#ef4444',
                        background: originalNode.color?.background || '#94a3b8'
                    }
                });
            }
        }
        
        // 如果仍無法加載，顯示錯誤訊息
        if (!resource) {
            removeDanglingNode(nodeId);
            detailCard.innerHTML = `
                <h3>${nodeId}</h3>
                <div class="empty-state">這個節點沒有可用的 Resource 資料，已從圖上移除。</div>
            `;
            return;
        }
    }

    await hydrateConnectedResources(connectedNodeIds);
    const connectedResources = getConnectedResources(nodeId, connectedNodeIds);
    const detailHtml = buildCompactDetailPanel(resource, connectedResources);

    detailCard.innerHTML = detailHtml;

    const openRelatedButton = document.getElementById('open-related-modal-action');
    if (openRelatedButton && connectedResources.length) {
        openRelatedButton.addEventListener('click', () => {
            openRelatedResourceModal(nodeId, connectedNodeIds, activeGroupModalView).catch((err) => {
                console.error('openRelatedResourceModal 失敗:', err);
            });
        })
    }
}


function buildResourceSummary(resource) {
    const rows = [];
    const resourceType = resource.resourceType;
    
    // 基本資訊：ID
    rows.push(`<div class="summary-row"><span>ID</span><span>${resource.id || "-"}</span></div>`);

    // 根據不同資源類型顯示特定資訊
    switch (resourceType) {
        case "Patient":
            buildPatientSummary(resource, rows);
            break;
        case "Observation":
            buildObservationSummary(resource, rows);
            break;
        case "Condition":
            buildConditionSummary(resource, rows);
            break;
        case "Procedure":
            buildProcedureSummary(resource, rows);
            break;
        case "Encounter":
            buildEncounterSummary(resource, rows);
            break;
        case "MedicationStatement":
        case "MedicationRequest":
            buildMedicationSummary(resource, rows);
            break;
        case "DiagnosticReport":
            buildDiagnosticReportSummary(resource, rows);
            break;
        case "Immunization":
            buildImmunizationSummary(resource, rows);
            break;
        case "AllergyIntolerance":
            buildAllergySummary(resource, rows);
            break;
        case "Organization":
            buildOrganizationSummary(resource, rows);
            break;
        case "Practitioner":
            buildPractitionerSummary(resource, rows);
            break;
        case "Claim":
            buildClaimSummary(resource, rows);
            break;
        case "ExplanationOfBenefit":
            buildExplanationOfBenefitSummary(resource, rows);
            break;
        default:
            buildGenericSummary(resource, rows);
            break;
    }

    return rows.join("");
}

// 建構分組的關聯資源顯示
async function buildGroupedRelatedResources(currentNodeId, connectedNodeIds, sectionTitle = "關聯資源詳情") {
    // 按資源類型分組
    const groupedResources = {};
    const resourceIcons = {
        "Observation": "🔬",
        "Condition": "🏥",
        "Procedure": "⚕️",
        "MedicationStatement": "💊",
        "MedicationRequest": "💊",
        "Patient": "👤",
        "Practitioner": "👨‍⚕️",
        "Organization": "🏢",
        "Encounter": "📋",
        "DiagnosticReport": "📊",
        "Immunization": "💉",
        "AllergyIntolerance": "⚠️",
        "Claim": "💰",
        "ExplanationOfBenefit": "📄"
    };
    
    // 收集需要載入的資源
    const resourcesToLoad = [];
    
    connectedNodeIds.forEach((id) => {
        // 如果沒有 currentNodeId（初始列表），包含所有資源；否則排除當前節點
        if (!currentNodeId || id !== currentNodeId) {
            const [resType, resId] = id.split("/");
            const resource = resourceMap.get(id);
            
            // 如果資源未載入，加入載入列表
            if (!resource && client && resType && resId) {
                resourcesToLoad.push({ id, resType, resId });
            }
            
            if (!groupedResources[resType]) {
                groupedResources[resType] = [];
            }
            
            groupedResources[resType].push({
                id,
                resId,
                resource
            });
        }
    });
    
    // 批量載入缺失的資源
    if (resourcesToLoad.length > 0) {
        await Promise.allSettled(
            resourcesToLoad.map(async ({ id, resType, resId }) => {
                try {
                    const loadedResource = await requestAll(`${resType}/${resId}`);
                    if (loadedResource) {
                        const resource = Array.isArray(loadedResource) ? loadedResource[0] : loadedResource;
                        if (resource && resource.resourceType) {
                            resourceMap.set(id, resource);
                            // 更新對應的分組資源
                            const groupItems = groupedResources[resType];
                            if (groupItems) {
                                const item = groupItems.find(i => i.id === id);
                                if (item) {
                                    item.resource = resource;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`無法載入資源 ${id}:`, error.message);
                }
            })
        );
    }
    
    // 建構 HTML
    const groups = [];
    Object.keys(groupedResources).sort().forEach((resType) => {
        const items = groupedResources[resType];
        
        // 按日期排序（從近到遠）
        items.sort((a, b) => {
            const dateA = getResourceDate(a.resource);
            const dateB = getResourceDate(b.resource);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateB) - new Date(dateA);
        });
        
        const chineseLabel = RESOURCE_LABELS[resType] || resType;
        const icon = resourceIcons[resType] || "📎";
        const color = TYPE_COLORS[resType] || TYPE_COLORS.Unknown;
        
        // 建構該類型的資源卡片
        const resourceCards = items.map((item) => {
            return buildResourceCard(item.resource, item.resId, item.id, resType, color);
        }).join("");
        
        groups.push(`
            <div class="resource-group">
                <div class="resource-group-header" onclick="toggleResourceGroup(this)">
                    <span class="group-icon">${icon}</span>
                    <span class="group-title">${chineseLabel}</span>
                    <span class="group-count">(${items.length} 項)</span>
                    <i class="fas fa-chevron-down group-toggle"></i>
                </div>
                <div class="resource-group-content">
                    ${resourceCards}
                </div>
            </div>
        `);
    });
    
    return `
        <div class="related-section-new">
            <h4><i class="fas fa-link"></i> ${sectionTitle}</h4>
            <div class="resource-groups">
                ${groups.join("")}
            </div>
        </div>
    `;
}

// 建構單個資源卡片
function buildResourceCard(resource, resId, nodeId, resType, color) {
    if (!resource) {
        // 未載入的資源，顯示 ID 和提示
        return `
            <div class="resource-card resource-card-unloaded" data-node-id="${nodeId}">
                <div class="resource-card-header">
                    <span class="resource-card-title" style="color: ${color};">${resId || nodeId}</span>
                </div>
                <div class="resource-card-body">
                    <div class="resource-field" style="color: #94a3b8; font-style: italic;">點擊載入詳細資料...</div>
                </div>
            </div>
        `;
    }
    
    // 根據資源類型建構簡要資訊
    const fields = buildResourceCardFields(resource);
    const title = getResourceCardTitle(resource);
    
    return `
        <div class="resource-card" data-node-id="${nodeId}">
            <div class="resource-card-header">
                <span class="resource-card-title" style="color: ${color};">${title}</span>
                <span class="resource-card-id">#${resource.id}</span>
            </div>
            <div class="resource-card-body">
                ${fields}
            </div>
        </div>
    `;
}

// 取得資源卡片標題
function getResourceCardTitle(resource) {
    const resType = resource.resourceType;
    
    switch (resType) {
        case "Observation":
            return resource.code?.text || getCodingDisplay(resource.code?.coding) || "觀察結果";
        case "Condition":
            return resource.code?.text || getCodingDisplay(resource.code?.coding) || "診斷";
        case "Procedure":
            return resource.code?.text || getCodingDisplay(resource.code?.coding) || "處置";
        case "MedicationStatement":
        case "MedicationRequest":
            return getMedicationDisplay(resource) || "藥物";
        case "Encounter":
            return resource.type?.[0]?.text || getCodingDisplay(resource.type?.[0]?.coding) || "就醫";
        case "Patient":
            return formatHumanName(resource.name?.[0]) || "病人";
        case "DiagnosticReport":
            return resource.code?.text || getCodingDisplay(resource.code?.coding) || "診斷報告";
        case "Immunization":
            return resource.vaccineCode?.text || getCodingDisplay(resource.vaccineCode?.coding) || "疫苗";
        case "AllergyIntolerance":
            return resource.code?.text || getCodingDisplay(resource.code?.coding) || "過敏";
        case "Organization":
            return resource.name || "組織";
        case "Practitioner":
            return formatHumanName(resource.name?.[0]) || "醫護人員";
        case "Claim":
            return getCodeableConceptDisplay(resource.type) || getCodeableConceptDisplay(resource.subType) || "醫療申報";
        case "ExplanationOfBenefit":
            return getCodeableConceptDisplay(resource.type) || getCodeableConceptDisplay(resource.subType) || "給付說明";
        default:
            return resource.id || resType;
    }
}

// 建構資源卡片欄位
function buildResourceCardFields(resource) {
    const fields = [];
    const resType = resource.resourceType;
    
    switch (resType) {
        case "Observation":
            if (resource.valueQuantity) {
                fields.push(`<div class="resource-field"><span>測量值:</span> <strong>${resource.valueQuantity.value} ${resource.valueQuantity.unit || ""}</strong></div>`);
            } else if (resource.valueString) {
                fields.push(`<div class="resource-field"><span>測量值:</span> <strong>${resource.valueString}</strong></div>`);
            }
            if (resource.effectiveDateTime) {
                fields.push(`<div class="resource-field"><span>時間:</span> ${formatDate(resource.effectiveDateTime)}</div>`);
            }
            break;
            
        case "Condition":
            if (resource.clinicalStatus) {
                const status = resource.clinicalStatus.coding?.[0]?.display || resource.clinicalStatus.coding?.[0]?.code;
                fields.push(`<div class="resource-field"><span>狀態:</span> ${status}</div>`);
            }
            if (resource.severity) {
                fields.push(`<div class="resource-field"><span>嚴重程度:</span> ${resource.severity.text || getCodingDisplay(resource.severity.coding)}</div>`);
            }
            if (resource.onsetDateTime) {
                fields.push(`<div class="resource-field"><span>發病:</span> ${formatDate(resource.onsetDateTime)}</div>`);
            }
            break;
            
        case "Procedure":
            if (resource.status) {
                fields.push(`<div class="resource-field"><span>狀態:</span> ${resource.status}</div>`);
            }
            if (resource.performedDateTime) {
                fields.push(`<div class="resource-field"><span>執行:</span> ${formatDate(resource.performedDateTime)}</div>`);
            }
            break;
            
        case "MedicationStatement":
        case "MedicationRequest":
            if (resource.dosage?.[0]?.text) {
                fields.push(`<div class="resource-field"><span>劑量:</span> ${resource.dosage[0].text}</div>`);
            }
            if (resource.effectivePeriod) {
                const start = formatDate(resource.effectivePeriod.start);
                const end = formatDate(resource.effectivePeriod.end);
                fields.push(`<div class="resource-field"><span>期間:</span> ${start} ~ ${end}</div>`);
            }
            break;
            
        case "Encounter":
            if (resource.status) {
                fields.push(`<div class="resource-field"><span>狀態:</span> ${resource.status}</div>`);
            }
            if (resource.period) {
                const start = formatDate(resource.period.start);
                fields.push(`<div class="resource-field"><span>時間:</span> ${start}</div>`);
            }
            if (resource.class) {
                fields.push(`<div class="resource-field"><span>分類:</span> ${resource.class.display || resource.class.code}</div>`);
            }
            break;
            
        case "Patient":
            if (resource.gender) {
                const genderMap = { male: "男", female: "女", other: "其他", unknown: "未知" };
                fields.push(`<div class="resource-field"><span>性別:</span> ${genderMap[resource.gender] || resource.gender}</div>`);
            }
            if (resource.birthDate) {
                fields.push(`<div class="resource-field"><span>出生:</span> ${resource.birthDate}</div>`);
            }
            break;
            
        case "Organization":
            if (resource.name) {
                fields.push(`<div class="resource-field"><span>名稱:</span> <strong>${resource.name}</strong></div>`);
            }
            if (resource.type?.[0]) {
                const orgType = resource.type[0].text || getCodingDisplay(resource.type[0].coding);
                fields.push(`<div class="resource-field"><span>類型:</span> ${orgType}</div>`);
            }
            if (resource.telecom) {
                const phone = resource.telecom.find(t => t.system === 'phone');
                if (phone) {
                    fields.push(`<div class="resource-field"><span>電話:</span> ${phone.value}</div>`);
                }
            }
            break;
            
        case "Practitioner":
            if (resource.name?.[0]) {
                const name = formatHumanName(resource.name[0]);
                fields.push(`<div class="resource-field"><span>姓名:</span> <strong>${name}</strong></div>`);
            }
            if (resource.qualification?.[0]) {
                const qualification = resource.qualification[0].code?.text || getCodingDisplay(resource.qualification[0].code?.coding);
                fields.push(`<div class="resource-field"><span>資格:</span> ${qualification}</div>`);
            }
            if (resource.telecom) {
                const phone = resource.telecom.find(t => t.system === 'phone');
                if (phone) {
                    fields.push(`<div class="resource-field"><span>電話:</span> ${phone.value}</div>`);
                }
            }
            break;
            
        default:
            if (resource.status) {
                fields.push(`<div class="resource-field"><span>狀態:</span> ${resource.status}</div>`);
            }
            break;
    }
    
    return fields.length > 0 ? fields.join("") : '<div class="resource-field">無額外資訊</div>';
}

// 切換資源分組的展開/收合
function toggleResourceGroup(headerElement) {
    const content = headerElement.nextElementSibling;
    const icon = headerElement.querySelector('.group-toggle');
    
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
}

// 獲取資源的日期（用於排序）
function getResourceDate(resource) {
    if (!resource) return null;
    
    // 根據不同資源類型返回相應的日期欄位
    const resType = resource.resourceType;
    
    switch (resType) {
        case "Observation":
            return resource.effectiveDateTime || resource.effectivePeriod?.start || resource.issued;
        case "Condition":
            return resource.onsetDateTime || resource.recordedDate || resource.assertedDate;
        case "Procedure":
            return resource.performedDateTime || resource.performedPeriod?.start;
        case "Encounter":
            return resource.period?.start;
        case "MedicationStatement":
        case "MedicationRequest":
            return resource.effectiveDateTime || resource.effectivePeriod?.start || resource.authoredOn;
        case "DiagnosticReport":
            return resource.effectiveDateTime || resource.issued;
        case "Immunization":
            return resource.occurrenceDateTime;
        case "AllergyIntolerance":
            return resource.recordedDate || resource.onsetDateTime;
        case "Claim":
        case "ExplanationOfBenefit":
            return resource.created;
        default:
            return resource.date || resource.authoredOn || resource.recordedDate || resource.effectiveDateTime;
    }
}

// 顯示初始的所有資源列表
async function renderInitialResourceList() {
    if (!detailCard || !patientResource) {
        return;
    }
    
    // 收集所有資源
    const allResourceIds = new Set();
    const patientNodeId = `Patient/${patientResource.id}`;
    allResourceIds.add(patientNodeId);
    
    // 添加所有已載入的資源
    RESOURCE_TYPES.forEach((type) => {
        const resources = resourcesByType[type] || [];
        resources.forEach((resource) => {
            const nodeId = `${resource.resourceType}/${resource.id}`;
            allResourceIds.add(nodeId);
        });
    });
    
    // 使用分組顯示函數
    const relatedHtml = await buildGroupedRelatedResources(null, allResourceIds);
    
    detailCard.innerHTML = `
        <h3>📊 所有資源總覽</h3>
        <div class="detail-summary">
            <div class="summary-row"><span>病人</span><span>${formatHumanName(patientResource.name?.[0])}</span></div>
            <div class="summary-row"><span>資源總數</span><span>${allResourceIds.size - 1} 項</span></div>
        </div>
        ${relatedHtml}
    `;
    
    // 為資源卡片添加點擊事件
    detailCard.querySelectorAll('.resource-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.resource-group-header')) {
                return;
            }
            
            const targetNodeId = card.getAttribute('data-node-id');
            if (targetNodeId && network) {
                detailCard.querySelectorAll('.resource-card').forEach(el => el.classList.remove('active'));
                card.classList.add('active');
                network.selectNodes([targetNodeId]);
                network.focus(targetNodeId, { scale: 1.2, animation: true });
            }
        });
    });
    
    // 初始化資源分組的展開狀態（預設全部展開）
    detailCard.querySelectorAll('.resource-group-content').forEach((content) => {
        content.style.maxHeight = content.scrollHeight + 'px';
    });
}

// Observation 專用摘要
function buildPatientSummary(resource, rows) {
    pushSummaryRow(rows, "姓名", formatHumanName(resource.name?.[0]));
    if (resource.active !== undefined) {
        pushSummaryRow(rows, "啟用狀態", resource.active ? "啟用中" : "停用");
    }

    const genderMap = { male: "男", female: "女", other: "其他", unknown: "未知" };
    pushSummaryRow(rows, "性別", genderMap[resource.gender] || resource.gender);
    pushSummaryRow(rows, "生日", resource.birthDate);
    pushSummaryRow(rows, "年齡", calculateAge(resource.birthDate));
    pushSummaryRow(rows, "電話", getTelecomValue(resource, "phone"));
    pushSummaryRow(rows, "Email", getTelecomValue(resource, "email"));
    pushSummaryRow(rows, "地址", formatAddress(resource.address?.[0]));
    pushSummaryRow(rows, "婚姻狀態", getCodeableConceptDisplay(resource.maritalStatus));
    pushSummaryRow(rows, "主要語言", getCodeableConceptDisplay(resource.communication?.find((item) => item.preferred)?.language) || getCodeableConceptDisplay(resource.communication?.[0]?.language));
    pushSummaryRow(rows, "主要照護者", getReferenceTitle(resource.generalPractitioner));
    pushSummaryRow(rows, "管理機構", getReferenceTitle(resource.managingOrganization));
}

function buildObservationSummary(resource, rows) {
    // 檢查項目名稱
    if (resource.code) {
        const codeName = resource.code.text || getCodingDisplay(resource.code.coding) || "-";
        rows.push(`<div class="summary-row"><span>檢查項目</span><span>${codeName}</span></div>`);
    }
    
    // 分類
    if (resource.category && resource.category.length > 0) {
        const category = resource.category[0].coding?.[0]?.display || 
                        resource.category[0].text || "-";
        rows.push(`<div class="summary-row"><span>分類</span><span>${category}</span></div>`);
    }
    
    // 測量值
    if (resource.valueQuantity) {
        const value = `${resource.valueQuantity.value || ""} ${resource.valueQuantity.unit || ""}`.trim();
        rows.push(`<div class="summary-row"><span>測量值</span><span>${value}</span></div>`);
    } else if (resource.valueString) {
        rows.push(`<div class="summary-row"><span>測量值</span><span>${resource.valueString}</span></div>`);
    } else if (resource.valueCodeableConcept) {
        const value = resource.valueCodeableConcept.text || 
                     getCodingDisplay(resource.valueCodeableConcept.coding) || "-";
        rows.push(`<div class="summary-row"><span>測量值</span><span>${value}</span></div>`);
    }
    
    // 參考範圍
    if (resource.referenceRange && resource.referenceRange.length > 0) {
        const range = resource.referenceRange[0];
        const low = range.low?.value || "";
        const high = range.high?.value || "";
        const unit = range.low?.unit || range.high?.unit || "";
        if (low || high) {
            rows.push(`<div class="summary-row"><span>參考範圍</span><span>${low}-${high} ${unit}</span></div>`);
        }
    }
    
    // 狀態
    if (resource.status) {
        pushSummaryRow(rows, "狀態", resource.status);
    }

    pushSummaryRow(rows, "解讀", getCodeableConceptDisplay(resource.interpretation));
    pushSummaryRow(rows, "執行者", getReferenceTitle(resource.performer));
    pushSummaryRow(rows, "檢體", getReferenceTitle(resource.specimen));
    
    // 檢查時間
    if (resource.effectiveDateTime) {
        rows.push(`<div class="summary-row"><span>檢查時間</span><span>${formatDate(resource.effectiveDateTime)}</span></div>`);
    } else if (resource.effectivePeriod) {
        const start = formatDate(resource.effectivePeriod.start);
        const end = formatDate(resource.effectivePeriod.end);
        rows.push(`<div class="summary-row"><span>檢查時間</span><span>${start} ~ ${end}</span></div>`);
    }
}

// Condition 專用摘要
function buildConditionSummary(resource, rows) {
    // 診斷名稱
    if (resource.code) {
        const conditionName = resource.code.text || getCodingDisplay(resource.code.coding) || "-";
        rows.push(`<div class="summary-row"><span>診斷名稱</span><span>${conditionName}</span></div>`);
    }
    
    // 臨床狀態
    if (resource.clinicalStatus) {
        const status = resource.clinicalStatus.coding?.[0]?.display || 
                      resource.clinicalStatus.coding?.[0]?.code || "-";
        rows.push(`<div class="summary-row"><span>臨床狀態</span><span>${status}</span></div>`);
    }
    
    // 驗證狀態
    if (resource.verificationStatus) {
        const status = resource.verificationStatus.coding?.[0]?.display || 
                      resource.verificationStatus.coding?.[0]?.code || "-";
        rows.push(`<div class="summary-row"><span>驗證狀態</span><span>${status}</span></div>`);
    }
    
    // 嚴重程度
    if (resource.severity) {
        const severity = resource.severity.text || getCodingDisplay(resource.severity.coding) || "-";
        rows.push(`<div class="summary-row"><span>嚴重程度</span><span>${severity}</span></div>`);
    }
    
    // 發病日期
    if (resource.onsetDateTime) {
        rows.push(`<div class="summary-row"><span>發病日期</span><span>${formatDate(resource.onsetDateTime)}</span></div>`);
    } else if (resource.onsetPeriod) {
        const start = formatDate(resource.onsetPeriod.start);
        rows.push(`<div class="summary-row"><span>發病日期</span><span>${start}</span></div>`);
    }
    
    // 記錄日期
    if (resource.recordedDate) {
        rows.push(`<div class="summary-row"><span>記錄日期</span><span>${formatDate(resource.recordedDate)}</span></div>`);
    }

    pushSummaryRow(rows, "部位", getCodeableConceptDisplay(resource.bodySite));
    pushSummaryRow(rows, "所屬就醫", getReferenceTitle(resource.encounter));
    pushSummaryRow(rows, "判定者", getReferenceTitle(resource.asserter));
    pushCountRow(rows, "支持證據", resource.evidence);
}

// Procedure 專用摘要
function buildProcedureSummary(resource, rows) {
    // 處置名稱
    if (resource.code) {
        const procedureName = resource.code.text || getCodingDisplay(resource.code.coding) || "-";
        rows.push(`<div class="summary-row"><span>處置名稱</span><span>${procedureName}</span></div>`);
    }
    
    // 狀態
    if (resource.status) {
        rows.push(`<div class="summary-row"><span>狀態</span><span>${resource.status}</span></div>`);
    }
    
    // 執行時間
    if (resource.performedDateTime) {
        rows.push(`<div class="summary-row"><span>執行時間</span><span>${formatDate(resource.performedDateTime)}</span></div>`);
    } else if (resource.performedPeriod) {
        const start = formatDate(resource.performedPeriod.start);
        const end = formatDate(resource.performedPeriod.end);
        rows.push(`<div class="summary-row"><span>執行時間</span><span>${start} ~ ${end}</span></div>`);
    }
    
    // 類別
    if (resource.category) {
        const category = resource.category.text || getCodingDisplay(resource.category.coding) || "-";
        rows.push(`<div class="summary-row"><span>類別</span><span>${category}</span></div>`);
    }

    pushSummaryRow(rows, "所屬就醫", getReferenceTitle(resource.encounter));
    pushSummaryRow(rows, "執行者", getReferenceTitle(resource.performer?.map((item) => item.actor)));
    pushSummaryRow(rows, "地點", getReferenceTitle(resource.location));
    pushSummaryRow(rows, "原因", getReferenceTitle(resource.reason));
    pushSummaryRow(rows, "結果", getReferenceTitle(resource.outcome));
    pushCountRow(rows, "併發症", resource.complication);
}

// Encounter 專用摘要
function buildEncounterSummary(resource, rows) {
    // 就醫類型
    if (resource.type && resource.type.length > 0) {
        const encounterType = resource.type[0].text || getCodingDisplay(resource.type[0].coding) || "-";
        rows.push(`<div class="summary-row"><span>就醫類型</span><span>${encounterType}</span></div>`);
    }
    
    // 狀態
    if (resource.status) {
        rows.push(`<div class="summary-row"><span>狀態</span><span>${resource.status}</span></div>`);
    }
    
    // 就醫時間
    if (resource.period) {
        const start = formatDate(resource.period.start);
        const end = formatDate(resource.period.end);
        if (start && end) {
            rows.push(`<div class="summary-row"><span>就醫時間</span><span>${start} ~ ${end}</span></div>`);
        } else if (start) {
            rows.push(`<div class="summary-row"><span>開始時間</span><span>${start}</span></div>`);
        }
    }
    
    // 就醫分類
    if (resource.class) {
        const classDisplay = resource.class.display || resource.class.code || "-";
        rows.push(`<div class="summary-row"><span>就醫分類</span><span>${classDisplay}</span></div>`);
    }

    pushSummaryRow(rows, "病人狀態", getCodeableConceptDisplay(resource.subjectStatus));
    pushSummaryRow(rows, "服務機構", getReferenceTitle(resource.serviceProvider));
    pushCountRow(rows, "參與者", resource.participant);
    pushCountRow(rows, "診斷", resource.diagnosis);
    pushCountRow(rows, "地點", resource.location);
}

// 藥物相關摘要
function buildMedicationSummary(resource, rows) {
    // 藥品名稱
    const medName = getMedicationDisplay(resource);
    if (medName) {
        rows.push(`<div class="summary-row"><span>藥品名稱</span><span>${medName}</span></div>`);
    }
    
    // 狀態
    if (resource.status) {
        rows.push(`<div class="summary-row"><span>狀態</span><span>${resource.status}</span></div>`);
    }
    
    // 劑量
    if (resource.dosage && resource.dosage.length > 0) {
        const dosage = resource.dosage[0].text || "-";
        rows.push(`<div class="summary-row"><span>劑量說明</span><span>${dosage}</span></div>`);
    }
    
    // 開立日期
    if (resource.authoredOn) {
        rows.push(`<div class="summary-row"><span>開立日期</span><span>${formatDate(resource.authoredOn)}</span></div>`);
    }
    
    // 有效期間
    if (resource.effectivePeriod) {
        const start = formatDate(resource.effectivePeriod.start);
        const end = formatDate(resource.effectivePeriod.end);
        rows.push(`<div class="summary-row"><span>用藥期間</span><span>${start} ~ ${end}</span></div>`);
    }

    pushSummaryRow(rows, "Intent", resource.intent);
    pushSummaryRow(rows, "優先度", resource.priority);
    pushSummaryRow(rows, "所屬就醫", getReferenceTitle(resource.encounter));
    pushSummaryRow(rows, "開立者", getReferenceTitle(resource.requester));
    pushSummaryRow(rows, "用藥原因", getReferenceTitle(resource.reason));
    pushSummaryRow(rows, "療程型態", getCodeableConceptDisplay(resource.courseOfTherapyType));
    pushSummaryRow(rows, "補藥次數", resource.dispenseRequest?.numberOfRepeatsAllowed);
    pushSummaryRow(rows, "每次供應", formatMoney(resource.dispenseRequest?.quantity));
}

// DiagnosticReport 專用摘要
function buildDiagnosticReportSummary(resource, rows) {
    // 報告名稱
    if (resource.code) {
        const reportName = resource.code.text || getCodingDisplay(resource.code.coding) || "-";
        rows.push(`<div class="summary-row"><span>報告名稱</span><span>${reportName}</span></div>`);
    }
    
    // 狀態
    if (resource.status) {
        rows.push(`<div class="summary-row"><span>狀態</span><span>${resource.status}</span></div>`);
    }
    
    // 分類
    if (resource.category && resource.category.length > 0) {
        const category = resource.category[0].text || getCodingDisplay(resource.category[0].coding) || "-";
        rows.push(`<div class="summary-row"><span>分類</span><span>${category}</span></div>`);
    }
    
    // 報告日期
    if (resource.effectiveDateTime) {
        rows.push(`<div class="summary-row"><span>報告日期</span><span>${formatDate(resource.effectiveDateTime)}</span></div>`);
    }
    
    // 發布日期
    if (resource.issued) {
        rows.push(`<div class="summary-row"><span>發布日期</span><span>${formatDate(resource.issued)}</span></div>`);
    }
    
    // 結論
    if (resource.conclusion) {
        rows.push(`<div class="summary-row"><span>結論</span><span>${resource.conclusion}</span></div>`);
    }

    pushSummaryRow(rows, "所屬就醫", getReferenceTitle(resource.encounter));
    pushSummaryRow(rows, "執行單位", getReferenceTitle(resource.performer));
    pushSummaryRow(rows, "判讀者", getReferenceTitle(resource.resultsInterpreter));
    pushCountRow(rows, "檢體", resource.specimen);
    pushCountRow(rows, "結果項目", resource.result);
    pushCountRow(rows, "影像/研究", resource.study);
}

// Immunization 專用摘要
function buildImmunizationSummary(resource, rows) {
    // 疫苗名稱
    if (resource.vaccineCode) {
        const vaccineName = resource.vaccineCode.text || getCodingDisplay(resource.vaccineCode.coding) || "-";
        rows.push(`<div class="summary-row"><span>疫苗名稱</span><span>${vaccineName}</span></div>`);
    }
    
    // 狀態
    if (resource.status) {
        rows.push(`<div class="summary-row"><span>狀態</span><span>${resource.status}</span></div>`);
    }
    
    // 接種日期
    if (resource.occurrenceDateTime) {
        rows.push(`<div class="summary-row"><span>接種日期</span><span>${formatDate(resource.occurrenceDateTime)}</span></div>`);
    }
    
    // 劑次
    if (resource.doseQuantity) {
        const dose = `${resource.doseQuantity.value || ""} ${resource.doseQuantity.unit || ""}`.trim();
        rows.push(`<div class="summary-row"><span>劑量</span><span>${dose}</span></div>`);
    }
}

// AllergyIntolerance 專用摘要
function buildAllergySummary(resource, rows) {
    // 過敏原
    if (resource.code) {
        const allergen = resource.code.text || getCodingDisplay(resource.code.coding) || "-";
        rows.push(`<div class="summary-row"><span>過敏原</span><span>${allergen}</span></div>`);
    }
    
    // 臨床狀態
    if (resource.clinicalStatus) {
        const status = resource.clinicalStatus.coding?.[0]?.display || 
                      resource.clinicalStatus.coding?.[0]?.code || "-";
        rows.push(`<div class="summary-row"><span>臨床狀態</span><span>${status}</span></div>`);
    }
    
    // 類型
    if (resource.type) {
        rows.push(`<div class="summary-row"><span>類型</span><span>${resource.type}</span></div>`);
    }
    
    // 嚴重程度
    if (resource.criticality) {
        rows.push(`<div class="summary-row"><span>嚴重程度</span><span>${resource.criticality}</span></div>`);
    }
    
    // 記錄日期
    if (resource.recordedDate) {
        rows.push(`<div class="summary-row"><span>記錄日期</span><span>${formatDate(resource.recordedDate)}</span></div>`);
    }
}

// 通用摘要（其他資源類型）
function buildOrganizationSummary(resource, rows) {
    // 組織名稱
    if (resource.name) {
        rows.push(`<div class="summary-row"><span>名稱</span><span><strong>${resource.name}</strong></span></div>`);
    }
    
    // 組織類型
    if (resource.type && resource.type.length > 0) {
        const typeText = resource.type[0].text || getCodingDisplay(resource.type[0].coding) || "-";
        rows.push(`<div class="summary-row"><span>類型</span><span>${typeText}</span></div>`);
    }
    
    // 聯絡電話
    if (resource.telecom) {
        const phone = resource.telecom.find(t => t.system === 'phone');
        if (phone) {
            rows.push(`<div class="summary-row"><span>電話</span><span>${phone.value}</span></div>`);
        }
        const email = resource.telecom.find(t => t.system === 'email');
        if (email) {
            rows.push(`<div class="summary-row"><span>Email</span><span>${email.value}</span></div>`);
        }
    }
    
    // 地址
    if (resource.address && resource.address.length > 0) {
        const addr = resource.address[0];
        const addressText = [addr.line, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ');
        if (addressText) {
            rows.push(`<div class="summary-row"><span>地址</span><span>${addressText}</span></div>`);
        }
    }

    if (resource.active !== undefined) {
        pushSummaryRow(rows, "啟用狀態", resource.active ? "啟用中" : "停用");
    }
    pushSummaryRow(rows, "描述", resource.description);
    pushSummaryRow(rows, "上層組織", getReferenceTitle(resource.partOf));
}

function buildPractitionerSummary(resource, rows) {
    // 醫護人員姓名
    if (resource.name && resource.name.length > 0) {
        const name = formatHumanName(resource.name[0]);
        rows.push(`<div class="summary-row"><span>姓名</span><span><strong>${name}</strong></span></div>`);
    }
    
    // 性別
    if (resource.gender) {
        const genderMap = { male: "男", female: "女", other: "其他", unknown: "未知" };
        rows.push(`<div class="summary-row"><span>性別</span><span>${genderMap[resource.gender] || resource.gender}</span></div>`);
    }
    
    // 資格
    if (resource.qualification && resource.qualification.length > 0) {
        resource.qualification.forEach((qual, index) => {
            const qualText = qual.code?.text || getCodingDisplay(qual.code?.coding) || "-";
            rows.push(`<div class="summary-row"><span>資格 ${index + 1}</span><span>${qualText}</span></div>`);
        });
    }
    
    // 聯絡電話
    if (resource.telecom) {
        const phone = resource.telecom.find(t => t.system === 'phone');
        if (phone) {
            rows.push(`<div class="summary-row"><span>電話</span><span>${phone.value}</span></div>`);
        }
        const email = resource.telecom.find(t => t.system === 'email');
        if (email) {
            rows.push(`<div class="summary-row"><span>Email</span><span>${email.value}</span></div>`);
        }
    }

    pushSummaryRow(rows, "生日", resource.birthDate);
    pushSummaryRow(rows, "主要語言", getCodeableConceptDisplay(resource.communication?.find((item) => item.preferred)?.language) || getCodeableConceptDisplay(resource.communication?.[0]?.language));
}

function buildClaimSummary(resource, rows) {
    pushSummaryRow(rows, "類型", getCodeableConceptDisplay(resource.type));
    pushSummaryRow(rows, "子類型", getCodeableConceptDisplay(resource.subType));
    pushSummaryRow(rows, "用途", resource.use);
    pushSummaryRow(rows, "建立日期", formatDate(resource.created));
    pushSummaryRow(rows, "帳務期間", formatPeriodRange(resource.billablePeriod));
    pushSummaryRow(rows, "服務提供者", getReferenceTitle(resource.provider));
    pushSummaryRow(rows, "保險方", getReferenceTitle(resource.insurer));
    pushSummaryRow(rows, "處理優先度", getCodeableConceptDisplay(resource.priority));
    pushSummaryRow(rows, "處方/醫令", getReferenceTitle(resource.prescription || resource.originalPrescription || resource.referral));
    pushCountRow(rows, "相關就醫", resource.encounter);
    pushCountRow(rows, "診斷", resource.diagnosis);
    pushCountRow(rows, "處置", resource.procedure);
    pushCountRow(rows, "保險資訊", resource.insurance);
    pushSummaryRow(rows, "病人自付", formatMoney(resource.patientPaid));
    pushSummaryRow(rows, "總額", formatMoney(resource.total));
    pushCountRow(rows, "申報項目", resource.item);
}

function buildExplanationOfBenefitSummary(resource, rows) {
    pushSummaryRow(rows, "類型", getCodeableConceptDisplay(resource.type));
    pushSummaryRow(rows, "子類型", getCodeableConceptDisplay(resource.subType));
    pushSummaryRow(rows, "用途", resource.use);
    pushSummaryRow(rows, "建立日期", formatDate(resource.created));
    pushSummaryRow(rows, "帳務期間", formatPeriodRange(resource.billablePeriod));
    pushSummaryRow(rows, "服務提供者", getReferenceTitle(resource.provider));
    pushSummaryRow(rows, "保險方", getReferenceTitle(resource.insurer));
    pushSummaryRow(rows, "處理結果", resource.outcome);
    pushSummaryRow(rows, "審核決定", getCodeableConceptDisplay(resource.decision));
    pushSummaryRow(rows, "處理說明", resource.disposition);
    pushSummaryRow(rows, "原始 Claim", getReferenceTitle(resource.claim));
    pushCountRow(rows, "相關就醫", resource.encounter);
    pushCountRow(rows, "保險資訊", resource.insurance);
    pushCountRow(rows, "給付總額", resource.total);
    pushSummaryRow(rows, "付款日期", formatDate(resource.payment?.date));
    pushSummaryRow(rows, "付款金額", formatMoney(resource.payment?.amount));
    pushSummaryRow(rows, "病人自付", formatMoney(resource.patientPaid));
    pushCountRow(rows, "給付項目", resource.item);
}

function buildGenericSummary(resource, rows) {
    // 狀態
    if (resource.status) {
        rows.push(`<div class="summary-row"><span>狀態</span><span>${resource.status}</span></div>`);
    }

    // 代碼
    if (resource.code) {
        rows.push(`<div class="summary-row"><span>代碼</span><span>${resource.code.text || getCodingDisplay(resource.code.coding) || "-"}</span></div>`);
    }

    // 日期
    if (resource.effectiveDateTime) {
        rows.push(`<div class="summary-row"><span>日期</span><span>${formatDate(resource.effectiveDateTime)}</span></div>`);
    }

    if (resource.authoredOn) {
        rows.push(`<div class="summary-row"><span>日期</span><span>${formatDate(resource.authoredOn)}</span></div>`);
    }

    if (resource.issued) {
        rows.push(`<div class="summary-row"><span>發布</span><span>${formatDate(resource.issued)}</span></div>`);
    }

    if (resource.subject && resource.subject.reference) {
        rows.push(`<div class="summary-row"><span>Subject</span><span>${resource.subject.reference}</span></div>`);
    }

    pushSummaryRow(rows, "標題", resource.code?.text || getCodeableConceptDisplay(resource.type));
    pushSummaryRow(rows, "建立日期", formatDate(resource.created));
    pushSummaryRow(rows, "期間", formatPeriodRange(resource.period || resource.billablePeriod || resource.actualPeriod));
    pushSummaryRow(rows, "所屬就醫", getReferenceTitle(resource.encounter));
    pushSummaryRow(rows, "提供者", getReferenceTitle(resource.provider || resource.performer || resource.requester));
    pushSummaryRow(rows, "機構", getReferenceTitle(resource.organization || resource.serviceProvider || resource.managingOrganization));
}

// 日期格式化輔助函數
function formatDate(dateString) {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-TW', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function formatHumanName(name) {
    if (!name) {
        return "未知";
    }
    if (name.text) {
        return name.text;
    }
    const given = name.given ? name.given.join(" ") : "";
    const family = name.family || "";
    return `${family}${given ? " " + given : ""}`.trim() || "未知";
}

function escapeHtml(value) {
    if (!value) {
        return "";
    }
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function safeBuildGraph() {
    try {
        if (typeof vis === "undefined") {
            console.error("vis 未定義");
            renderFallbackGraph("未載入 vis-network，改用靜態清單顯示。");
            return;
        }
        buildGraph();
    } catch (error) {
        console.error("buildGraph 執行錯誤:", error);
        showError("關聯圖渲染失敗", error);
        renderFallbackGraph("關聯圖渲染失敗，改用靜態清單顯示。");
    }
}

function renderInitialGroupOverview() {
    if (!detailCard || !patientResource) {
        return;
    }

    const groupCards = Object.entries(RESOURCE_GROUPS)
        .map(([groupId, group]) => {
            const resources = getGroupResources(groupId);
            if (!resources.length) {
                return "";
            }
            const latestDate = getLatestGroupDate(resources);
            return `
                <button class="group-overview-card" type="button" data-group-id="${groupId}">
                    <span class="group-overview-icon" style="background:${group.color};">
                        <i class="fas ${group.icon}" aria-hidden="true"></i>
                    </span>
                    <span class="group-overview-copy">
                        <strong>${group.label}</strong>
                        <span>${resources.length} 項資源</span>
                        <span>${latestDate ? `最近時間：${formatDate(latestDate)}` : "尚無日期資訊"}</span>
                    </span>
                </button>
            `;
        })
        .join("");

    detailCard.innerHTML = `
        <h3>Resource 類型總覽</h3>
        <div class="detail-summary">
            <div class="summary-row"><span>病人</span><span>${formatHumanName(patientResource.name?.[0])}</span></div>
            <div class="summary-row"><span>類型數</span><span>${Object.keys(RESOURCE_GROUPS).filter((groupId) => getGroupResources(groupId).length > 0).length} 類</span></div>
        </div>
        <div class="group-overview-list">
            ${groupCards || '<div class="empty-state">目前沒有可用資源群組</div>'}
        </div>
    `;

    detailCard.querySelectorAll(".group-overview-card").forEach((button) => {
        button.addEventListener("click", () => {
            const groupId = button.dataset.groupId;
            if (!groupId) {
                return;
            }
            const groupNodeId = `Group/${groupId}`;
            if (network && nodes.get(groupNodeId)) {
                network.selectNodes([groupNodeId]);
                network.focus(groupNodeId, { scale: 1.05, animation: true });
            } else {
                renderGroupSummary(groupId);
                openGroupModal(groupId, "summary");
            }
        });
    });
}

function renderGroupSummary(groupId) {
    const group = RESOURCE_GROUPS[groupId];
    if (!group || !detailCard) {
        return;
    }

    const resources = sortResourcesByDate(getGroupResources(groupId));
    const previewItems = resources.slice(0, 5).map((resource) => {
        const nodeId = `${resource.resourceType}/${resource.id}`;
        return `
            <button class="group-resource-preview" type="button" data-resource-id="${nodeId}">
                <span class="group-resource-preview-title">${escapeHtml(getResourceCardTitle(resource))}</span>
                <span class="group-resource-preview-meta">${RESOURCE_LABELS[resource.resourceType] || resource.resourceType} · ${getDisplayDate(resource) || "無日期"}</span>
            </button>
        `;
    }).join("");

    detailCard.innerHTML = `
        <h3>${group.label}</h3>
        <div class="detail-summary">
            <div class="summary-row"><span>資源數</span><span>${resources.length} 項</span></div>
            <div class="summary-row"><span>Resource Type</span><span>${group.types[0]}</span></div>
        </div>
        <button class="primary-btn group-summary-action" id="open-group-modal-action" type="button">
            <i class="fas fa-up-right-from-square" aria-hidden="true"></i> 開啟分群摘要
        </button>
        <div class="group-resource-preview-list">
            ${previewItems || '<div class="empty-state">此群組沒有資源</div>'}
        </div>
    `;

    const openButton = document.getElementById("open-group-modal-action");
    if (openButton) {
        openButton.addEventListener("click", () => openGroupModal(groupId, "summary"));
    }

    detailCard.querySelectorAll(".group-resource-preview").forEach((button) => {
        button.addEventListener("click", () => {
            const resourceId = button.dataset.resourceId;
            if (!resourceId) {
                return;
            }
            openResourceStory(resourceId);
        });
    });
}

function openGroupModal(groupId, view = "table") {
    if (!groupModal || !groupModalBody || !groupModalTitle || !groupModalMeta) {
        return;
    }

    activeModalMode = "group";
    activeGroupModalId = groupId;
    activeGroupModalView = view;
    activeGroupSummarySearch = "";
    activeGroupSummarySelectedNodeId = null;
    activeGroupSummaryExpandedIndexes = new Set();
    groupModal.hidden = false;
    document.body.classList.add("modal-open");
    renderGroupModal();
}

function closeGroupModal() {
    if (!groupModal) {
        return;
    }

    groupModal.hidden = true;
    document.body.classList.remove("modal-open");
    activeModalMode = "group";
    activeGroupModalId = null;
    activeGroupModalView = "table";
    activeRelatedContext = null;
    activeGroupSummarySearch = "";
    activeGroupSummarySelectedNodeId = null;
    activeGroupSummaryExpandedIndexes = new Set();
}

function renderGroupModal() {
    if (activeModalMode === "related") {
        const sourceResource = activeRelatedContext ? resourceMap.get(activeRelatedContext.sourceNodeId) : null;
        const resources = activeRelatedContext ? sortResourcesByDate(activeRelatedContext.resources) : [];
        const selectedTypes = activeRelatedContext?.selectedTypes || [];
        const filterTypes = Array.from(new Set(resources.map((item) => item.resourceType).filter(Boolean))).sort();
        const selectedTypeSet = new Set(selectedTypes);
        const filteredResources = resources.filter((item) => !selectedTypeSet.size || selectedTypeSet.has(item.resourceType));

        if (activeRelatedContext && (!activeRelatedContext.selectedNodeId || !filteredResources.some((item) => `${item.resourceType}/${item.id}` === activeRelatedContext.selectedNodeId))) {
            activeRelatedContext.selectedNodeId = filteredResources[0] ? `${filteredResources[0].resourceType}/${filteredResources[0].id}` : null;
        }

        const groupedResources = sourceResource
            ? buildEncounterRelatedGroups(sourceResource, filteredResources)
            : [];
        const listMarkup = sourceResource
            ? buildEncounterRelatedListView(groupedResources, activeRelatedContext ? activeRelatedContext.selectedNodeId : null)
            : buildRelatedTableView(filteredResources, activeRelatedContext ? activeRelatedContext.selectedNodeId : null);

        const selectedResource = activeRelatedContext && activeRelatedContext.selectedNodeId
            ? filteredResources.find((item) => `${item.resourceType}/${item.id}` === activeRelatedContext.selectedNodeId)
            : null;

        groupModalTitle.textContent = sourceResource
            ? `與該 ${sourceResource.resourceType} 相關的 Resource`
            : "相關 Resource";
        groupModalMeta.textContent = `${filteredResources.length} 項相關資料`;
        groupModalBody.innerHTML = `
            <div class="related-modal-toolbar">
                <div class="related-toolbar-block">
                    <span class="related-filter-label">ResourceType 篩選</span>
                    ${buildRelatedFilterChips(filterTypes, selectedTypes)}
                </div>
            </div>
            <div class="related-modal-layout">
                <div class="related-modal-list">
                    ${listMarkup}
                </div>
                <div class="related-modal-detail">
                    ${buildRelatedResourceDetail(selectedResource)}
                </div>
            </div>
        `;

        groupModalBody.querySelectorAll("[data-filter-type]").forEach((element) => {
            element.addEventListener("click", () => {
                if (!activeRelatedContext) {
                    return;
                }

                const filterType = element.dataset.filterType;
                if (!filterType || filterType === "all") {
                    activeRelatedContext.selectedTypes = [];
                    renderGroupModal();
                    return;
                }

                const currentTypes = new Set(activeRelatedContext.selectedTypes || []);
                if (currentTypes.has(filterType)) {
                    currentTypes.delete(filterType);
                } else {
                    currentTypes.add(filterType);
                }

                activeRelatedContext.selectedTypes = currentTypes.size === filterTypes.length
                    ? []
                    : Array.from(currentTypes).sort();
                renderGroupModal();
            });
        });

        groupModalBody.querySelectorAll("[data-resource-id]").forEach((element) => {
            element.addEventListener("click", () => {
                if (!activeRelatedContext) {
                    return;
                }
                activeRelatedContext.selectedNodeId = element.dataset.resourceId;
                //點擊下去後可以直接進入明細的節點
                //focusResourceNodeInGraph(activeRelatedContext.selectedNodeId);
                renderGroupModal();
            });
        });

        const openResourceButton = document.getElementById("related-detail-open-resource");
        if (openResourceButton) {
            openResourceButton.addEventListener("click", () => {
                const resourceId = openResourceButton.dataset.nodeId;
                closeGroupModal();
                openResourceStory(resourceId);
            });
        }
        return;
    }

    const group = RESOURCE_GROUPS[activeGroupModalId];
    if (!group || !groupModalBody || !groupModalTitle || !groupModalMeta) {
        return;
    }

    const resources = sortResourcesByDate(getGroupResources(activeGroupModalId));
    const currentView = ["summary", "table"].includes(activeGroupModalView)
        ? activeGroupModalView
        : "summary";

    if (currentView !== "summary") {
        activeGroupSummarySelectedNodeId = null;
    }

    const viewMarkup = currentView === "summary"
        ? buildGroupSummaryView(resources, group, activeGroupSummarySelectedNodeId)
        : buildGroupTableView(resources, group);
    groupModalTitle.textContent = `${group.label}資源`;
    groupModalMeta.textContent = `${resources.length} 項 · ${group.types[0]}`;
    groupModalBody.innerHTML = `
        <div class="group-modal-toolbar-wrap">
            <div class="group-modal-toolbar" role="tablist" aria-label="${escapeHtml(group.label)} 檢視切換">
                <button type="button" class="group-view-toggle ${currentView === "summary" ? "active" : ""}" data-group-view="summary">Summary</button>
                <button type="button" class="group-view-toggle ${currentView === "table" ? "active" : ""}" data-group-view="table">Table</button>
            </div>
            <div class="group-summary-tools ${currentView === "summary" ? "" : "hidden"}">
                <label class="group-summary-search" for="group-summary-search-input">
                    <span>搜尋</span>
                    <input
                        id="group-summary-search-input"
                        type="search"
                        placeholder="搜尋標題、日期、狀態或 ID"
                        value="${escapeHtml(activeGroupSummarySearch)}"
                    />
                </label>
            </div>
        </div>
        ${viewMarkup}
    `;

    groupModalBody.querySelectorAll("[data-group-view]").forEach((element) => {
        element.addEventListener("click", () => {
            const nextView = element.dataset.groupView;
            if (!nextView || !["summary", "table"].includes(nextView) || nextView === activeGroupModalView) {
                return;
            }
            activeGroupModalView = nextView;
            renderGroupModal();
        });
    });

    const summarySearchInput = groupModalBody.querySelector("#group-summary-search-input");
    if (summarySearchInput) {
        summarySearchInput.addEventListener("input", () => {
            activeGroupSummarySearch = summarySearchInput.value || "";
            applyGroupSummarySearch(groupModalBody, activeGroupSummarySearch);
        });
    }

    applyGroupSummarySearch(groupModalBody, activeGroupSummarySearch);

    groupModalBody.querySelectorAll("[data-summary-section-idx]").forEach((element) => {
        const toggleSection = () => {
            const idx = element.dataset.summarySectionIdx;
            if (idx == null) {
                return;
            }

            if (activeGroupSummaryExpandedIndexes.has(idx)) {
                activeGroupSummaryExpandedIndexes.delete(idx);
            } else {
                activeGroupSummaryExpandedIndexes.add(idx);
            }
            renderGroupModal();
        };

        element.addEventListener("click", toggleSection);
        element.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleSection();
            }
        });
    });

    groupModalBody.querySelectorAll("[data-resource-id]").forEach((element) => {
        element.addEventListener("click", () => {
            const resourceId = element.dataset.resourceId;
            if (!resourceId) {
                return;
            }

            if (currentView === "summary") {
                activeGroupSummarySelectedNodeId = resourceId;
                //點擊下去後可以直接進入明細的節點
                //focusResourceNodeInGraph(resourceId);
                renderGroupModal();
                return;
            }

            closeGroupModal();
            openResourceStory(resourceId);
        });
    });

    const openSummaryResourceButton = document.getElementById("group-summary-open-resource");
    if (openSummaryResourceButton) {
        openSummaryResourceButton.addEventListener("click", () => {
            const resourceId = openSummaryResourceButton.dataset.nodeId;
            if (!resourceId) {
                return;
            }
            closeGroupModal();
            openResourceStory(resourceId);
        });
    }
}

function buildGroupTableView(resources, group) {
    if (!resources.length) {
        return '<div class="empty-state">此群組沒有可顯示資料</div>';
    }

    const rows = resources.map((resource) => {
        const nodeId = `${resource.resourceType}/${resource.id}`;
        return `
            <tr class="group-table-row" data-resource-id="${nodeId}" tabindex="0">
                <td>${escapeHtml(getDisplayDate(resource) || "-")}</td>
                <td>${escapeHtml(getResourceCardTitle(resource))}</td>
                <td>${escapeHtml(getResourceStatus(resource) || "-")}</td>
                <td>${escapeHtml(resource.id || "-")}</td>
            </tr>
        `;
    }).join("");

    return `
        <div class="group-table-wrap" data-group-color="${group.color}">
            <table class="group-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>標題</th>
                        <th>狀態</th>
                        <th>ID</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
    }

function normalizeGroupingLabel(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
}

function groupResourcesByDisplayTitle(resources) {
    const groups = new Map();

    resources.forEach((resource) => {
        const rawTitle = normalizeGroupingLabel(getResourceCardTitle(resource));
        const title = rawTitle || `未命名 ${RESOURCE_LABELS[resource.resourceType] || resource.resourceType}`;
        if (!groups.has(title)) {
            groups.set(title, []);
        }
        groups.get(title).push(resource);
    });

    return Array.from(groups.entries())
        .map(([title, items]) => {
            const sortedItems = sortResourcesByDate(items);
            const latestDate = sortedItems.length ? getDisplayDate(sortedItems[0]) : "";
            const statusCounts = new Map();

            sortedItems.forEach((resource) => {
                const status = getResourceStatus(resource);
                if (!status) {
                    return;
                }
                statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
            });

            const topStatusEntry = Array.from(statusCounts.entries())
                .sort((left, right) => right[1] - left[1])[0];

            return {
                title,
                resources: sortedItems,
                count: sortedItems.length,
                latestDate,
                topStatus: topStatusEntry ? topStatusEntry[0] : "",
                preview: sortedItems.slice(0, 3)
            };
        })
        .sort((left, right) => {
            if (right.count !== left.count) {
                return right.count - left.count;
            }
            return left.title.localeCompare(right.title);
        });
}

function buildGroupSummaryView(resources, group, selectedNodeId) {
    if (!resources.length) {
        return '<div class="empty-state">此群組沒有可顯示資料</div>';
    }

    const groupedSummaries = groupResourcesByDisplayTitle(resources);
    const sections = groupedSummaries.map((summary, summaryIndex) => {
        const isExpanded = activeGroupSummaryExpandedIndexes.has(String(summaryIndex));
        const itemsMarkup = summary.resources.map((resource) => {
            const nodeId = `${resource.resourceType}/${resource.id}`;
            const isActive = nodeId === selectedNodeId ? "active" : "";
            const dateText = getDisplayDate(resource) || "無日期";
            const statusText = getResourceStatus(resource) || "未標示狀態";
            const searchText = `${getResourceCardTitle(resource)} ${dateText} ${statusText} ${resource.id || ""}`;
            return `
                <button type="button" class="group-summary-item ${isActive}" data-resource-id="${escapeHtml(nodeId)}" data-search-text="${escapeHtml(searchText)}">
                    <span class="group-summary-item-main">
                        <span class="group-summary-item-meta">${escapeHtml(dateText)} · ${escapeHtml(statusText)}</span>
                    </span>
                    <span class="group-summary-item-id">${escapeHtml(`ID:${resource.id || "-"}`)}</span>
                </button>
            `;
        }).join("");

        return `
            <section class="group-summary-section">
                <div
                    class="group-summary-header"
                    data-summary-section-idx="${summaryIndex}"
                    role="button"
                    tabindex="0"
                    aria-expanded="${isExpanded ? "true" : "false"}"
                >
                    <div>
                        <h4>${escapeHtml(summary.title)}</h4>
                    </div>
                    <div class="group-summary-header-tail">
                        <span class="group-summary-count">${summary.count}</span>
                        <span class="group-summary-chevron" aria-hidden="true">${isExpanded ? "−" : "+"}</span>
                    </div>
                </div>
                <div class="group-summary-items" ${isExpanded ? "" : "hidden"}>
                    ${itemsMarkup}
                </div>
            </section>
        `;
    }).join("");

    const selectedResource = selectedNodeId
        ? resources.find((item) => `${item.resourceType}/${item.id}` === selectedNodeId)
        : null;

    return `
        <div class="related-modal-layout group-summary-layout">
            <div class="related-modal-list">
                <div class="group-summary-list">
                    ${sections}
                </div>
            </div>
            <div class="related-modal-detail group-summary-detail">
                ${buildRelatedResourceDetail(selectedResource, {
                    emptyText: "請從左側選擇一筆資源",
                    buttonId: "group-summary-open-resource"
                })}
            </div>
        </div>
    `;
}

function applyGroupSummarySearch(container, keyword) {
    const summaryList = container ? container.querySelector(".group-summary-list") : null;
    if (!summaryList) {
        return;
    }

    const normalizedKeyword = normalizeGroupingLabel(keyword).toLowerCase();
    const sections = Array.from(summaryList.querySelectorAll(".group-summary-section"));
    let visibleSectionCount = 0;

    sections.forEach((section) => {
        const titleText = (section.querySelector(".group-summary-header h4")?.textContent || "").toLowerCase();
        const items = Array.from(section.querySelectorAll(".group-summary-item"));
        let visibleItems = 0;

        items.forEach((item) => {
            const searchText = (item.dataset.searchText || "").toLowerCase();
            const matched = !normalizedKeyword
                || searchText.includes(normalizedKeyword)
                || titleText.includes(normalizedKeyword);
            item.hidden = !matched;
            if (matched) {
                visibleItems += 1;
            }
        });

        section.hidden = visibleItems === 0;
        if (!section.hidden) {
            visibleSectionCount += 1;
        }

        const countNode = section.querySelector(".group-summary-count");
        if (countNode) {
            countNode.textContent = String(visibleItems);
        }
    });

    let emptyNode = summaryList.querySelector(".group-summary-empty");
    if (visibleSectionCount === 0) {
        if (!emptyNode) {
            emptyNode = document.createElement("div");
            emptyNode.className = "group-summary-empty empty-state";
            summaryList.appendChild(emptyNode);
        }
        emptyNode.textContent = normalizedKeyword
            ? `找不到符合「${keyword}」的 Summary 資料`
            : "此群組沒有可顯示資料";
    } else if (emptyNode) {
        emptyNode.remove();
    }
}

function sortResourcesByDate(resources) {
    return [...resources].sort((a, b) => {
        const dateA = getResourceDate(a);
        const dateB = getResourceDate(b);
        if (!dateA && !dateB) {
            return (a.id || "").localeCompare(b.id || "");
        }
        if (!dateA) {
            return 1;
        }
        if (!dateB) {
            return -1;
        }
        return new Date(dateB) - new Date(dateA);
    });
}

function getLatestGroupDate(resources) {
    const sorted = sortResourcesByDate(resources);
    return sorted.length ? getResourceDate(sorted[0]) : null;
}

function getDisplayDate(resource) {
    const date = getResourceDate(resource);
    return date ? formatDate(date) : "";
}

function getResourceStatus(resource) {
    if (!resource) {
        return "";
    }

    return resource.status
        || resource.clinicalStatus?.coding?.[0]?.display
        || resource.clinicalStatus?.coding?.[0]?.code
        || resource.verificationStatus?.coding?.[0]?.display
        || resource.lifecycleStatus
        || "";
}