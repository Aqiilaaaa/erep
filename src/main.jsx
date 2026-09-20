import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
const NETWORK_HOST = "192.168.56.1";
const NETWORK_PORT = "5173";
const PUBLIC_APP_URL = "https://ereport-beta.vercel.app";

const getSignUrl = (role, reportId) =>
  `${PUBLIC_APP_URL}/sign/${role}/${encodeURIComponent(reportId)}`;
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createRoot,
} from "react-dom/client";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  Bell,
  ChevronRight,
  PenLine,
  QrCode,
  ClipboardList,
  Save,
  Send,
  UserPlus,
  Download,
  Eye,
  CheckCircle2,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  QRCodeCanvas,
} from "qrcode.react";

import {
  generateReportPDF,
} from "./pdf";

import {
  db,
} from "./firebase";

import "./style.css";
import "./notification.css";
import "./style_admin_vendor_full.css";
import "./style_sidebar_toggle.css";
import "./style_account_password.css";
import "./signature.css";


/* =========================================================
   DEMO ACCOUNTS
========================================================= */

const initialAccounts = [
  {
    id: "admin-1",
    name: "Aqiila Aviani",
    email: "admin@ereport.com",
    role: "Admin",
    password: "bebas",
  },

  {
    id: "user-1",
    name: "Muhammad S. Febrianto",
    email: "user@ereport.com",
    role: "User",
    password: "bebas",
  },

  {
    id: "client-1",
    name: "PT Citra Media",
    email: "client@ereport.com",
    role: "Client",
    password: "bebas",
  },

  {
    id: "user-2",
    name: "Dika Ryan Maulana",
    email: "dika@ereport.com",
    role: "User",
    password: "bebas",
  },
];


/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  // PRODUCT
  product: "",
  model: "",
  typeForm: "",
  serialNumber: "",
  batteryType: "",
  batteryQuantity: "",

  // WORK STATUS
  workStatus: "",
  repairNo: "",

  // ENVIRONMENT
  temperature: "",
  ventilation: "Good",
  areaCondition: "Clean",
  wiring: "Good",
  fanRotation: "Good",
  loadApplication: "",

  // ACTIONS TAKEN
  actionsTaken: {
    cleaningUpsUnit: false,
    componentCheck: false,
    connectorCheck: false,
    batteryCheck: false,
    emergencyTest: false,
    panelInstallationCheck: false,
    loadCheck: false,
    others: "",
  },

  // PARTS
  partsUsed: "",
  partsReplacementRecommended: "",

  // INPUT VOLTAGE
  inputVoltage: {
    rs: "",
    st: "",
    tr: "",
    rn: "",
    sn: "",
    tn: "",
    frequency: "",
  },

  // OUTPUT VOLTAGE
  outputVoltage: {
    rs: "",
    st: "",
    tr: "",
    rn: "",
    sn: "",
    tn: "",
    frequency: "",
  },

  // INPUT CURRENT
  inputCurrent: {
    r: "",
    s: "",
    t: "",
  },

  // OUTPUT CURRENT
  outputCurrent: {
    r: "",
    s: "",
    t: "",
  },

  // OTHER MEASUREMENTS
  dcBusVoltage: "",
  batteryChargeVoltage: "",
  batteryTotalVoltage: "",
  batteryChargeCurrent: "",
  groundVoltage: "",
  lowBatteries: "",

  // NOTES
  notes: "",

  // COOLING SYSTEM REPORT
  reportKind: "PM",
  formId: "",
  reportDate: "",
  reportTime: "",
  reportedBy: "",
  contact: "",
  unitId: "",
  unitType: "PAC",
  locationRoom: "",
  technicianName: "",
  slaType: "Tanpa penggantian spare part",
  slaTarget: "≤ 1×24 jam",
  slaRealization: "",
  slaStatus: "",
  timeline: {
    laporMasuk: "",
    response: "",
    mulaiPerbaikan: "",
    selesaiPerbaikan: "",
    verifikasi: "",
  },
  environment: {
    roomTempTarget: "",
    roomTempActual: "",
    roomTempStatus: "",
    supplyTempTarget: "",
    supplyTempActual: "",
    supplyTempStatus: "",
    deltaTTarget: "",
    deltaTActual: "",
    deltaTStatus: "",
    rhTarget: "",
    rhActual: "",
    rhStatus: "",
  },
  pmParameters: {
    suctionPressure: { value: "", status: "", notes: "" },
    dischargePressure: { value: "", status: "", notes: "" },
    leakCheck: { value: "", status: "", method: "", notes: "" },
    indoorFanCurrent: { value: "", status: "", notes: "" },
    indoorFanFlow: { value: "", status: "", notes: "" },
    outdoorFanCurrent: { value: "", status: "", notes: "" },
    outdoorFanFlow: { value: "", status: "", notes: "" },
    soundVibration: { value: "", status: "", condition: "", notes: "" },
    drainFlow: { value: "", status: "", notes: "" },
    noLeakOverflow: { value: "", status: "", notes: "" },
    setpointTemp: { value: "", status: "", notes: "" },
    setpointRh: { value: "", status: "", notes: "" },
    alarmLog: { value: "", status: "", notes: "" },
    voltageLL: { value: "", status: "", phase: "", notes: "" },
    voltageLN: { value: "", status: "", notes: "" },
    compressorCurrent: { value: "", status: "", notes: "" },
    fanCurrent: { value: "", status: "", notes: "" },
    heaterCurrent: { value: "", status: "", notes: "" },
    terminalConnection: { value: "", status: "", condition: "", notes: "" },
    filterCleaned: { value: "", status: "", date: "", pic: "" },
    filterReplaced: { value: "", status: "", date: "", pic: "" },
    coilEvaporator: { value: "", status: "", notes: "" },
    coilCondenser: { value: "", status: "", notes: "" },
    refrigerant: { value: "", status: "", notes: "" },
    fanMotor: { value: "", status: "", notes: "" },
    drain: { value: "", status: "", notes: "" },
    controlAlarm: { value: "", status: "", notes: "" },
    electrical: { value: "", status: "", notes: "" },
  },
  findings: {
    mainFinding: "",
    followUp: "",
    targetCompletion: "",
    pic: "",
    requiredCM: "",
    workOrderCM: "",
  },
  diagnosis: {
    alarmCode: "",
    symptom: "",
    riskImpact: "",
    workDone: "",
    returnRoom: "",
    monitoringDuration: "",
    verificationNote: "",
  },
  sparePart: "",
  evidenceId: "",
  evidenceBefore: "",
  evidenceAfter: "",
  // PHOTO
  attachmentPhoto: "",
};

/* =========================================================
   DEMO REPORT
========================================================= */

const initialReports = [
  {
    id: "ER-260823-014",

    type: "Maintenance",

    title: "Three Phase UPS",

    client: "PT Citra Media",

    technician: "Muhammad S. Febrianto",

    status: "Draft",

    date: "23 Aug 2026",

    technicianSigned: false,

    clientSigned: false,

    technicianSignature: "",

    clientSignature: "",

    clientSignedAt: null,

    form: {
      ...emptyForm,
    },
  },
];


/* =========================================================
   DEFAULT TEMPLATES
========================================================= */

const formatDateForInput = (value) => {
  if (!value) return "";

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const match = String(value).match(
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/
  );

  if (match) {
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const month = months[match[2]];

    if (month) {
      return `${match[3]}-${month}-${String(match[1]).padStart(2, "0")}`;
    }
  }

  return "";
};

const formatDateForReport = (value) => {
  if (!value) return "";

  const [year, month, day] = String(value).split("-");

  if (!year || !month || !day) {
    return value;
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
};

const initialTemplates = [
  {
    id: "UPS-3P",
    name: "Three Phase UPS",
    category: "Maintenance",
    fields: 14,
  },
  {
    id: "UPS-1P",
    name: "Single Phase UPS",
    category: "Maintenance",
    fields: 12,
  },
  {
    id: "COOLING",
    name: "Cooling System",
    category: "Inspection",
    fields: 10,
  },
  {
    id: "REPAIR",
    name: "UPS Battery Cabinet",
    category: "Repair",
    fields: 13,
  },
];


/* =========================================================
   APP
========================================================= */

function App() {
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    page,
    setPage,
  ] = useState("dashboard");

  const [
    accounts,
    setAccounts,
  ] = useState(initialAccounts);

  const [
    reports,
    setReports,
  ] = useState([]);

  const [
    selectedReport,
    setSelectedReport,
  ] = useState(null);

  const [
    mobileMenu,
    setMobileMenu,
  ] = useState(false);

  const [
    showCreateAccount,
    setShowCreateAccount,
  ] = useState(false);

  const [
    editingAccount,
    setEditingAccount,
  ] = useState(null);

  const [
    newAccountRole,
    setNewAccountRole,
  ] = useState("User");

  const [
    templates,
    setTemplates,
  ] = useState(initialTemplates);

  const [
    editingTemplate,
    setEditingTemplate,
  ] = useState(null);

  const [
    showTemplateModal,
    setShowTemplateModal,
  ] = useState(false);
  /* =======================================================
     QR ROUTE
  ======================================================= */

  const path =
    window.location.pathname;

  const signParts =
    path.startsWith("/sign/")
      ? path.split("/")
      : [];

  const signRole =
    signParts.length >= 4
      ? signParts[2]
      : "client";

  const signReportId =
    signParts.length >= 4
      ? signParts[3]
      : signParts[2] || null;


  /* =======================================================
     LOAD FIREBASE ACCOUNTS + REPORTS
  ======================================================= */

  useEffect(() => {
    if (signReportId) {
      return;
    }

    const loadData = async () => {
      try {
        // ACCOUNTS: data is managed from the web UI.
        const accountSnapshot = await getDocs(
          collection(db, "accounts")
        );

        if (accountSnapshot.empty) {
          // First-run seed so the app can be entered without
          // manually creating anything in Firebase Console.
          await Promise.all(
            initialAccounts.map((account) =>
              setDoc(
                doc(db, "accounts", account.id),
                account
              )
            )
          );

          setAccounts(initialAccounts);
        } else {
          const firebaseAccounts =
            accountSnapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            }));

          setAccounts(firebaseAccounts);
        }

        // REPORTS: all report data comes from Firestore.
        const reportSnapshot = await getDocs(
          collection(db, "reports")
        );

        const firebaseReports =
          reportSnapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));

        // Firestore is the single source of truth for reports.
        // If all reports were deleted, keep the UI empty after reload
        // instead of falling back to the old demo report.
        setReports(firebaseReports);

        // TEMPLATES
        const templateSnapshot = await getDocs(
          collection(db, "templates")
        );

        if (templateSnapshot.empty) {
          await Promise.all(
            initialTemplates.map((template) =>
              setDoc(
                doc(db, "templates", template.id),
                template
              )
            )
          );

          setTemplates(initialTemplates);
        } else {
          setTemplates(
            templateSnapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            }))
          );
        }

      } catch (error) {
        console.error(
          "Load Firebase data error:",
          error
        );
      }
    };

    loadData();

  }, [signReportId]);


  /* =======================================================
     LOGIN
  ======================================================= */

  const login =
    (account) => {

      setCurrentUser(
        account
      );

      if (
        account.role ===
        "Admin"
      ) {
        setPage(
          "dashboard"
        );

      } else if (
        account.role ===
        "User"
      ) {
        setPage(
          "jobs"
        );

      } else {
        setPage(
          "reports"
        );
      }
    };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {

    setCurrentUser(
      null
    );

    setSelectedReport(
      null
    );

    setPage(
      "dashboard"
    );
  };


  /* =======================================================
     OPEN REPORT
  ======================================================= */

  const openReport =
    async (report) => {

      setMobileMenu(false);

      // Vendor: clicking a report must directly generate/open the PDF.
      // Admin and Technician keep the existing report-detail flow.
      if (currentUser?.role === "Client" || currentUser?.role === "Vendor") {
        try {
          const pdfUrl = await generateReportPDF({
            ...report,
            openInNewTab: true,
          });

          if (pdfUrl) {
            window.open(
              pdfUrl,
              "_blank",
              "noopener,noreferrer"
            );
          }
        } catch (error) {
          console.error("Vendor PDF generation error:", error);
          alert("Gagal membuat PDF report.");
        }
        return;
      }

      setSelectedReport(report);
      setPage("report");
    };


  /* =======================================================
     UPDATE REPORT
  ======================================================= */

  const updateReport =
    async (
      updatedReport
    ) => {

      try {

        await setDoc(
          doc(
            db,
            "reports",
            updatedReport.id
          ),
          updatedReport
        );


        setReports(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                updatedReport.id
                  ? updatedReport
                  : item
            )
        );


        setSelectedReport(
          updatedReport
        );

      } catch (error) {

        console.error(
          error
        );

        alert(
          "Gagal menyimpan report."
        );
      }
    };


  /* =======================================================
     DELETE REPORT
     ADMIN ONLY
  ======================================================= */

  const deleteReport =
    async (reportId) => {

      const confirmed =
        window.confirm(
          "Yakin ingin menghapus report ini?"
        );

      if (!confirmed) {
        return;
      }

      try {

        await deleteDoc(
          doc(
            db,
            "reports",
            reportId
          )
        );

        setReports(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !== reportId
            )
        );

        setSelectedReport(null);
        setPage("reports");

      } catch (error) {

        console.error(
          "Delete report error:",
          error
        );

        alert(
          "Gagal menghapus report."
        );
      }
    };


  /* =======================================================
     CREATE ACCOUNT
     ADMIN ONLY
  ======================================================= */

  const saveAccount =
    async (data) => {

      const normalized = {
        name: data.name.trim(),
        email: data.email.trim(),
        role: data.role,
        password: "bebas",
      };

      if (
        !normalized.name ||
        !normalized.email
      ) {
        alert("Nama dan email wajib diisi.");
        return;
      }

      const account = editingAccount
        ? {
            ...editingAccount,
            ...normalized,
          }
        : {
            ...normalized,
            id: Date.now().toString(),
          };

      try {

        await setDoc(
          doc(db, "accounts", account.id),
          account
        );

        setAccounts((prev) =>
          editingAccount
            ? prev.map((item) =>
                item.id === account.id
                  ? account
                  : item
              )
            : [...prev, account]
        );

        setShowCreateAccount(false);
        setEditingAccount(null);

      } catch (error) {

        console.error(
          "Account save error:",
          error
        );

        alert(
          "Gagal menyimpan akun. Pastikan Firestore Rules mengizinkan write."
        );
      }
    };


  const deleteAccount =
    async (account) => {

      if (
        account.id === currentUser?.id
      ) {
        alert(
          "Akun yang sedang dipakai tidak bisa dihapus."
        );
        return;
      }

      if (
        !window.confirm(
          `Hapus akun ${account.name}?`
        )
      ) {
        return;
      }

      try {

        await deleteDoc(
          doc(db, "accounts", account.id)
        );

        setAccounts((prev) =>
          prev.filter(
            (item) =>
              item.id !== account.id
          )
        );

      } catch (error) {

        console.error(
          "Account delete error:",
          error
        );

        alert(
          "Gagal menghapus akun."
        );
      }
    };


  const openEditAccount =
    (account) => {

      setEditingAccount(account);
      setNewAccountRole(account.role);
      setShowCreateAccount(true);

    };


  const saveTemplate =
    async (data) => {

      const template = editingTemplate
        ? {
            ...editingTemplate,
            ...data,
          }
        : {
            ...data,
            id:
              data.id ||
              "TPL-" +
                Date.now()
                  .toString()
                  .slice(-6),
          };

      try {

        await setDoc(
          doc(db, "templates", template.id),
          template
        );

        setTemplates((prev) =>
          editingTemplate
            ? prev.map((item) =>
                item.id === template.id
                  ? template
                  : item
              )
            : [template, ...prev]
        );

        setShowTemplateModal(false);
        setEditingTemplate(null);

      } catch (error) {

        console.error(
          "Template save error:",
          error
        );

        alert(
          "Gagal menyimpan template."
        );
      }
    };


  const deleteTemplate =
    async (template) => {

      if (
        !window.confirm(
          `Hapus template ${template.name}?`
        )
      ) {
        return;
      }

      try {

        await deleteDoc(
          doc(
            db,
            "templates",
            template.id
          )
        );

        setTemplates((prev) =>
          prev.filter(
            (item) =>
              item.id !== template.id
          )
        );

      } catch (error) {

        console.error(
          "Template delete error:",
          error
        );

        alert(
          "Gagal menghapus template."
        );
      }
    };


  const openEditTemplate =
    (template) => {

      setEditingTemplate(template);
      setShowTemplateModal(true);

    };


  /* =======================================================
     UPDATE CURRENT ACCOUNT
     ADMIN / ACCOUNT
  ======================================================= */

  const updateCurrentUser =
    async (data) => {

      const nextUser = {
        ...currentUser,
        name: data.name.trim(),
        email: data.email.trim(),
      };

      if (data.password) {
        nextUser.password = data.password;
      }

      if (!nextUser.name || !nextUser.email) {
        alert("Nama dan email wajib diisi.");
        return;
      }

      try {

        await setDoc(
          doc(db, "accounts", nextUser.id),
          nextUser
        );

        setAccounts((prev) =>
          prev.map((item) =>
            item.id === nextUser.id
              ? nextUser
              : item
          )
        );

        setCurrentUser(nextUser);

        alert("Profil berhasil diperbarui.");

      } catch (error) {

        console.error(
          "Current account update error:",
          error
        );

        alert(
          "Gagal memperbarui profil."
        );
      }
    };



  /* =======================================================
     CREATE REPORT
  ======================================================= */

  const createReport =
    async (data) => {

      const newReport = {

        id:
          "ER-" +
          Date.now()
            .toString()
            .slice(-6),

        type:
          data.type,

        title:
          data.title,

        client:
          data.client,

        technician:
          data.technician,

        status:
          "Draft",

        date:
          data.date,

        technicianSigned:
          false,

        clientSigned:
          false,

        technicianSignature:
          "",

        clientSignature:
          "",

        clientSignedAt:
          null,

        form: {
          ...emptyForm,
          ...(data.form || {}),
        },
      };


      try {

        await setDoc(
          doc(
            db,
            "reports",
            newReport.id
          ),
          newReport
        );


        setReports(
          (prev) => [
            newReport,
            ...prev,
          ]
        );

        setSelectedReport(
          newReport
        );

        setPage(
          "report"
        );

      } catch (error) {

        console.error(
          error
        );

        alert(
          "Gagal membuat report."
        );
      }
    };


  /* =======================================================
     QR CLIENT SIGNING PAGE
  ======================================================= */

  if (signReportId) {

    return (
      <ClientSigningPage
        reportId={
          signReportId
        }
        role={
          signRole
        }
      />
    );
  }


  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  if (!currentUser) {

    return (
      <Login
        accounts={
          accounts
        }
        onLogin={
          login
        }
      />
    );
  }


  /* =======================================================
     MAIN APPLICATION
  ======================================================= */

  return (

    <div className="app">

  {/* =====================================================
      HEADER
  ===================================================== */}

  <header className="topHeader">

    <div className="headerBrand">

      <div className="brandLogo">
        E
      </div>

      <div className="brandText">

        <b>
          E-REPORT
        </b>

        <small>
          FIELD SERVICE
        </small>

      </div>

    </div>


    <button
      type="button"
      className="headerMenuButton"
      onClick={() =>
        setMobileMenu(
          !mobileMenu
        )
      }
      aria-label="Toggle menu"
    >

      <Menu
        size={22}
      />

    </button>

  </header>


  {/* =====================================================
      RIGHT MENU
  ===================================================== */}

  {mobileMenu && (

    <div className="menuDrawer">

      {currentUser.role === "Admin" && (
        <>

          <NavButton
            active={
              page === "dashboard"
            }
            onClick={() => {
              setPage("dashboard");
              setMobileMenu(false);
            }}
            icon={
              <LayoutDashboard
                size={16}
              />
            }
            text="Dashboard"
          />


          <NavButton
            active={
              page === "reports"
            }
            onClick={() => {
              setPage("reports");
              setMobileMenu(false);
            }}
            icon={
              <FileText
                size={16}
              />
            }
            text="Reports"
          />


          <NavButton
            active={
              page === "users"
            }
            onClick={() => {
              setPage("users");
              setMobileMenu(false);
            }}
            icon={
              <Users
                size={16}
              />
            }
            text="Technicians"
          />

        </>
      )}


      {currentUser.role === "User" && (
        <>

          <NavButton
            active={
              page === "jobs"
            }
            onClick={() => {
              setPage("jobs");
              setMobileMenu(false);
            }}
            icon={
              <ClipboardList
                size={16}
              />
            }
            text="My Jobs"
          />


          <NavButton
            active={
              page === "reports"
            }
            onClick={() => {
              setPage("reports");
              setMobileMenu(false);
            }}
            icon={
              <FileText
                size={16}
              />
            }
            text="My Reports"
          />

        </>
      )}


      {(currentUser.role === "Client" || currentUser.role === "Vendor") && (

        <NavButton
          active={
            page === "reports"
          }
          onClick={() => {
            setPage("reports");
            setMobileMenu(false);
          }}
          icon={
            <FileText
              size={16}
            />
          }
          text="My Reports"
        />

      )}


      <div className="menuDivider" />


      <NavButton
        active={
          page === "account"
        }
        onClick={() => {
          setPage("account");
          setMobileMenu(false);
        }}
        icon={
          <Settings
            size={16}
          />
        }
        text="Account"
      />


      <button
        type="button"
        className="menuSignOut"
        onClick={logout}
      >

        <LogOut
          size={16}
        />

        Sign out

      </button>

    </div>

  )}


  {/* =====================================================
      CONTENT
  ===================================================== */}

      <main>

        {/* ADMIN DASHBOARD */}

        {
          page ===
            "dashboard" &&
          currentUser.role ===
            "Admin" && (

            <AdminDashboard
              reports={
                reports
              }

              openReport={
                openReport
              }

              
            />

          )
        }


        {/* TECHNICIAN JOBS */}

        {
          page ===
            "jobs" &&
          currentUser.role ===
            "User" && (

            <TechnicianJobs
              user={
                currentUser
              }

              reports={
                reports
              }

              openReport={
                openReport
              }
            />

          )
        }


        {/* REPORTS */}

        {
          page ===
            "reports" && (

          <Reports
            user={currentUser}
            reports={reports}
            openReport={openReport}
            onNewReport={() => setPage("create-report")}
          />

          )
        }


        {/* CREATE REPORT PAGE */}

        {
          page ===
            "create-report" &&
          currentUser.role ===
            "Admin" && (

            <CreateReportPage
              accounts={
                accounts
              }

              close={() =>
                setPage(
                  "reports"
                )
              }

              onCreate={
                createReport
              }
            />

          )
        }


        {/* REPORT DETAIL */}

        {
          page ===
            "report" &&
          selectedReport && (

            <ReportDetail
              report={
                selectedReport
              }

              user={
                currentUser
              }

              updateReport={
                updateReport
              }

              deleteReport={
                deleteReport
              }

              accounts={
                accounts
              }

              back={() => {

                if (
                  currentUser.role ===
                  "User"
                ) {

                  setPage(
                    "jobs"
                  );

                } else {

                  setPage(
                    "reports"
                  );
                }

              }}
            />

          )
        }


        {/* USERS */}

        {
          page ===
            "users" &&
          currentUser.role ===
            "Admin" && (

            <UsersPage
              accounts={
                accounts
              }

              openAdd={(role = "User") => {
                setEditingAccount(null);
                setNewAccountRole(role);
                setShowCreateAccount(true);
              }}

              openEdit={
                openEditAccount
              }

              onDelete={
                deleteAccount
              }
            />

          )
        }


        {/* ACCOUNT */}

        {
          page ===
            "account" && (

            <AccountPage
              user={
                currentUser
              }
              onSave={
                updateCurrentUser
              }
            />

          )
        }

      </main>


      {/* ADMIN CREATE ACCOUNT */}

      {
        showCreateAccount && (

          <CreateAccountModal
            close={() => {
              setShowCreateAccount(false);
              setEditingAccount(null);
              setNewAccountRole("User");
            }}

            onSave={
              saveAccount
            }

            initialAccount={
              editingAccount
            }

            defaultRole={
              newAccountRole
            }
          />

        )
      }

      {
        showTemplateModal && (

          <TemplateModal
            close={() => {
              setShowTemplateModal(false);
              setEditingTemplate(null);
            }}

            onSave={
              saveTemplate
            }

            initialTemplate={
              editingTemplate
            }
          />

        )
      }


    </div>
  );
}


/* =========================================================
   LOGIN
========================================================= */

function Login({
  accounts,
  onLogin,
}) {

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  const submit =
    (e) => {

      e.preventDefault();

      const account =
        accounts.find(
          (item) =>
            item.email
              .toLowerCase() ===
            email
              .toLowerCase()
        );


      if (!account) {

        setError(
          "Akun tidak ditemukan."
        );

        return;
      }

      const storedPassword =
        account.password || "bebas";

      if (
        password !==
        storedPassword
      ) {
        setError(
          "Sandi salah."
        );
        return;
      }

      onLogin(
        account
      );
    };


  return (

    <div
      className="loginPage"
    >

      <div
        className="loginCard"
      >

        <div
          className="loginLogo"
        >
          E
        </div>


        <small
          className="loginBrand"
        >
          E-REPORT
        </small>


        <h1>
          Welcome back
        </h1>


        <p>
          Sign in to continue
          to your workspace.
        </p>


        <form
          onSubmit={
            submit
          }
        >

          <label>
            Email

            <input
              type="email"
              value={
                email
              }
              onChange={
                (e) =>
                  setEmail(
                    e.target.value
                  )
              }
              required
            />
          </label>


          <label>
            Password

            <input
              type="password"
              value={
                password
              }
              onChange={
                (e) =>
                  setPassword(
                    e.target.value
                  )
              }
              required
            />
          </label>


          {
            error && (

              <div
                className="loginError"
              >
                {error}
              </div>

            )
          }


          <button
            className="loginButton"
          >
            Sign in
          </button>

        </form>


        <div
          className="demoAccounts"
        >

          <b>
            Demo accounts
          </b>

          <span>
            admin@ereport.com
          </span>

          <span>
            user@ereport.com
          </span>

          <span>
            client@ereport.com
          </span>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SIDEBAR
========================================================= */

/* =========================================================
   NAV BUTTON
========================================================= */

function NavButton({
  active,
  onClick,
  icon,
  text,
}) {

  return (

    <button
      className={
        active
          ? "active"
          : ""
      }

      onClick={
        onClick
      }
    >

      {icon}

      {text}

    </button>
  );
}


/* =========================================================
   TOP BAR
========================================================= */

function TopBar({
  title,
  subtitle,
  action,
  reports = [],
}) {

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const notifications =
    Array.isArray(reports)
      ? reports
          .filter(
            (report) =>
              report?.status &&
              report.status !== "Submitted" &&
              report.status !== "Draft"
          )
          .slice(0, 5)
      : [];

  // Notification badge hanya muncul untuk notifikasi yang belum dibaca.
  // Key memakai ID + status supaya perubahan status report dianggap sebagai
  // notifikasi baru meskipun report ID-nya sama.
  const getNotificationKey = (report) =>
    `${report.id}:${report.status}`;

  const [
    readNotificationKeys,
    setReadNotificationKeys,
  ] = useState(() => {
    try {
      const stored =
        localStorage.getItem("ereport_read_notifications");

      return stored
        ? JSON.parse(stored)
        : [];
    } catch {
      return [];
    }
  });

  const unreadNotifications =
    notifications.filter(
      (report) =>
        !readNotificationKeys.includes(
          getNotificationKey(report)
        )
    );

  const openNotificationPanel = () => {
    const currentKeys = notifications.map(
      getNotificationKey
    );

    const nextReadKeys = Array.from(
      new Set([
        ...readNotificationKeys,
        ...currentKeys,
      ])
    );

    setReadNotificationKeys(
      nextReadKeys
    );

    try {
      localStorage.setItem(
        "ereport_read_notifications",
        JSON.stringify(nextReadKeys)
      );
    } catch {
      // Ignore localStorage errors.
    }

    setShowNotifications(true);
  };

  return (

    <div
      className="topBar"
    >

      <div>

        <small>
          {subtitle}
        </small>

        <h1>
          {title}
        </h1>

      </div>


      <div
        className="topActions"
      >

        <div
          className="notificationWrap"
        >

          <button
            type="button"
            className="notification"
            onClick={() => {
              if (showNotifications) {
                setShowNotifications(false);
              } else {
                openNotificationPanel();
              }
            }}
            aria-label="Notifications"
          >

            <Bell
              size={15}
            />

            {
              unreadNotifications.length > 0 && (

                <span
                  className="notificationBadge"
                >
                  {
                    unreadNotifications.length > 9
                      ? "9+"
                      : unreadNotifications.length
                  }
                </span>

              )
            }

          </button>


          {
            showNotifications && (

              <div
                className="notificationDropdown"
              >

                <div
                  className="notificationHeader"
                >
                  <b>
                    Notifications
                  </b>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                  >
                    ×
                  </button>
                </div>


                {
                  notifications.length === 0 ? (

                    <div
                      className="notificationEmpty"
                    >
                      Tidak ada notifikasi baru.
                    </div>

                  ) : (

                    <div
                      className="notificationList"
                    >

                      {
                        notifications.map(
                          (report) => (

                            <div
                              className="notificationItem"
                              key={report.id}
                            >

                              <b>
                                {report.title ||
                                  report.id}
                              </b>

                              <span>
                                Status:{" "}
                                {report.status}
                              </span>

                            </div>

                          )
                        )
                      }

                    </div>

                  )
                }

              </div>

            )
          }

        </div>


        {action}

      </div>

    </div>
  );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const LOCATION_DASHBOARD_DATA = {
  Jakarta: {
    kpdjp: [
      "Unit Pengelolaan Jakarta 01",
      "Unit Pengelolaan Jakarta 02",
      "Area Operasional Jakarta",
    ],
    rooms: [
      {
        name: "Ruang UPS",
        floor: "Lantai 1",
        color: "green",
        total: 20,
        description:
          "Menopang panel UPS dengan kombinasi AC ceiling berkapasitas besar, AC standing & split cadangan, humidifier penjaga kelembapan, dan satu unit PAC.",
        items: [
          { name: "AC Ceiling", types: 1, units: 10, models: [["Daikin FH48NUV1", 10]] },
          { name: "AC Standing", types: 1, units: 4, models: [["TCL TAC-42CF/F", 4]] },
          { name: "AC Split", types: 2, units: 2, models: [["Panasonic CS-PC18GKF", 1], ["Panasonic CS-PC18JKP", 1]] },
          { name: "Humidifier", types: 1, units: 2, models: [["Tatung TCD-3EL", 2]] },
          { name: "Precision Air Conditioning", types: 1, units: 2, models: [["Schneider TDAV0921A", 2]] },
        ],
      },
      {
        name: "Ruang Server",
        floor: "Lantai 2",
        color: "purple",
        total: 22,
        description:
          "Menjaga suhu ruang server dengan kombinasi PAC Liebert & Schneider serta beberapa unit AC standing dan split sebagai cadangan.",
        items: [
          { name: "Precision Air Conditioning", types: 7, units: 16, models: [["Liebert P2070FASM S1R", 2], ["Liebert P1035DAS3CHS12S1D000CA000", 2], ["Schneider TDAV1321A", 2], ["Schneider TDAV1622A", 4], ["Liebert P2060DA104H912E1DL00CE032", 2], ["Liebert DME07MH1UA1", 2], ["Liebert P1030DA106H912E1DL00CE032", 2]] },
          { name: "AC Standing", types: 3, units: 4, models: [["TCL TAC-42CF/C", 1], ["Panasonic CS-J45FFP8", 2], ["Daist DGF-52S2", 1]] },
          { name: "AC Split", types: 1, units: 2, models: [["Daikin FTKM71SVM4", 2]] },
        ],
      },
      {
        name: "Ruang NOC",
        floor: "Lantai 3",
        color: "orange",
        total: 11,
        description:
          "Menjaga kondisi ruang NOC tetap stabil untuk mendukung operasional jaringan dan perangkat monitoring.",
        items: [
          { name: "AC Cassette", types: 7, units: 7, models: [["AC Cassette 3.1", 1], ["AC Cassette 3.2", 1], ["AC Cassette 3.3", 1], ["AC Cassette 3.4", 1], ["AC Cassette 3.5", 1], ["AC Cassette 3.6", 1], ["AC Cassette 3.7", 1]] },
          { name: "AC Standing Floor", types: 2, units: 2, models: [["AC Standing Floor 3.1", 1], ["AC Standing Floor 3.2", 1]] },
          { name: "AC Split Wall", types: 2, units: 2, models: [["AC Split Wall 3.1", 1], ["AC Split Wall 3.2", 1]] },
        ],
      },
    ],
  },
  Bandung: { kpdjp: ["Unit Pengelolaan Bandung 01", "Area Operasional Bandung"], rooms: [] },
  Bekasi: { kpdjp: ["Unit Pengelolaan Bekasi 01", "Area Operasional Bekasi"], rooms: [] },
  Makassar: { kpdjp: ["Unit Pengelolaan Makassar 01", "Area Operasional Makassar"], rooms: [] },
  Bali: { kpdjp: ["Unit Pengelolaan Bali 01", "Area Operasional Bali"], rooms: [] },
};

function RoomSummaryCard({ room }) {
  return (
    <div className={`critical-room critical-room-${room.color}`}>
      <div className="critical-room-head">
        <div>
          <span className="critical-floor">{room.floor}</span>
          <h3>{room.name}</h3>
        </div>
        <div className="critical-room-total">{room.total} unit</div>
      </div>

      <div className="critical-room-body">
        <p>{room.description}</p>
        <div className="critical-item-grid">
          {room.items.map((item) => (
            <div className="critical-item-card" key={item.name}>
              <div className="critical-item-title">
                <strong>{item.name}</strong>
                <span>{item.types} tipe · {item.units} unit</span>
              </div>
              <div className="critical-model-list">
                {item.models.map(([model, units]) => (
                  <div key={model}>
                    <span>{model}</span>
                    <b>{units} unit</b>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ reports, openReport }) {
  // Alur sesuai referensi: Lokasi -> KPDJP -> detail ruang kritis.
  const [location, setLocation] = useState("");
  const [selectedKpdjp, setSelectedKpdjp] = useState("");
  const [tableView, setTableView] = useState(false);

  const selectedData = location
    ? LOCATION_DASHBOARD_DATA[location]
    : null;

  const kpdjpByLocation = location
    ? selectedData?.kpdjp || []
    : Object.entries(LOCATION_DASHBOARD_DATA).flatMap(([loc, value]) =>
        (value.kpdjp || []).map((name) => ({ name, location: loc }))
      );

  const openKpdjp = (name, loc = location) => {
    setLocation(loc);
    setSelectedKpdjp(name);
    setTableView(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToKpdjp = () => {
    setSelectedKpdjp("");
    setTableView(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rooms = selectedData?.rooms || [];
  const totalUnits = rooms.reduce((sum, room) => sum + room.total, 0);

  // DETAIL KPDJP
  if (selectedKpdjp) {
    return (
      <div className="content admin-location-page">
        <TopBar reports={reports} title="Dashboard" subtitle="ADMIN / LOCATION OVERVIEW" />

        <button className="location-back-button" onClick={backToKpdjp}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
          Kembali ke daftar KPDJP
        </button>

        <section className="location-breadcrumb-panel">
          <div>
            <small>LOKASI / KPDJP</small>
            <h2>{selectedKpdjp}</h2>
            <p>{location} · Detail sistem</p>
          </div>
          <button className="location-change-button" onClick={backToKpdjp}>
            Pilih Unit / Area Lain
          </button>
        </section>

        {rooms.length > 0 ? (
          <section className="critical-dashboard">
            <div className="critical-title-card">
              <div>
                <small>SISTEM PENDINGIN RUANG KRITIS</small>
                <h1>Peralatan Pendingin & Kelembapan Ruang Kritis</h1>
                <span>Distribusi unit AC, Precision Air Conditioning (PAC), dan humidifier pada ruang kritis.</span>
              </div>
              <button className="table-toggle" onClick={() => setTableView((v) => !v)}>
                {tableView ? "Tampilkan sebagai kartu" : "Tampilkan sebagai tabel"}
              </button>
            </div>

            <div className="critical-stat-grid">
              <div><strong>{rooms.length}</strong><span>Lokasi / ruang</span></div>
              <div><strong>{rooms.reduce((sum, room) => sum + room.items.length, 0)}</strong><span>Jenis peralatan</span></div>
              <div><strong>{totalUnits}</strong><span>Total unit terpasang</span></div>
            </div>

            {!tableView ? (
              <>
                <div className="critical-system-node">
                  <strong>Sistem Pendingin Ruang Kritis</strong>
                  <span>{rooms.length} lokasi · {totalUnits} unit</span>
                </div>
                <div className="critical-legend">
                  {rooms.map((room) => (
                    <span key={room.name}>
                      <i className={`legend-dot ${room.color}`} />
                      {room.name} · {room.floor}
                    </span>
                  ))}
                </div>
                <div className="critical-bar-chart">
                  {rooms.map((room) => (
                    <div className="critical-bar-row" key={room.name}>
                      <span>{room.name}</span>
                      <div className="critical-bar-track">
                        <div
                          className={`critical-bar-fill ${room.color}`}
                          style={{ width: `${Math.max(18, (room.total / totalUnits) * 100)}%` }}
                        >
                          <b>{room.total}</b>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="critical-rooms-list">
                  {rooms.map((room) => <RoomSummaryCard room={room} key={room.name} />)}
                </div>
              </>
            ) : (
              <div className="critical-table-wrap">
                <table className="critical-table">
                  <thead>
                    <tr><th>Ruang</th><th>Lantai</th><th>Jenis</th><th>Model</th><th>Unit</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {rooms.flatMap((room) => room.items.flatMap((item) => item.models.map(([model, units]) => (
                      <tr key={`${room.name}-${model}`}>
                        <td>{room.name}</td><td>{room.floor}</td><td>{item.name}</td><td>{model}</td><td>{units}</td>
                        <td><span className="status-normal">Normal</span></td>
                      </tr>
                    ))))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="empty-location-panel">
            <Building2 size={30} />
            <h3>Data ruang kritis belum tersedia</h3>
            <p>Data detail untuk <b>{selectedKpdjp}</b> belum tersedia. Struktur ini siap diisi setelah master data KPDJP diberikan.</p>
          </section>
        )}
      </div>
    );
  }

  // HOME: persis mengikuti alur referensi pertama.
  return (
    <div className="content admin-location-page">
      <TopBar reports={reports} title="Dashboard" subtitle="ADMIN / OVERVIEW" />

      <section className="vendor-style-location-filter">
        <label htmlFor="admin-location">Lokasi</label>
        <select
          id="admin-location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setSelectedKpdjp("");
          }}
        >
          <option value="">Semua Lokasi</option>
          {Object.keys(LOCATION_DASHBOARD_DATA).map((item) => (
            <option value={item} key={item}>{item}</option>
          ))}
        </select>
      </section>

      <section className="kpdjp-confirmation-section">
        <div className="confirmation-heading">
          <h2>Siap Untuk Konfirmasi</h2>
          <span>{location ? `Pilih unit / area di ${location}` : "Pilih lokasi terlebih dahulu"}</span>
        </div>

        <div className="kpdjp-card-row">
          {location ? (
            (selectedData?.kpdjp || []).map((name, index) => (
              <button
                key={name}
                className="kpdjp-dashboard-card"
                onClick={() => openKpdjp(name, location)}
              >
                <small>UNIT / AREA</small>
                <strong>{name}</strong>
                <span>{index === 0 && selectedData.rooms.length ? `${selectedData.rooms.reduce((s, r) => s + r.total, 0)} unit terdata` : "Buka detail"}</span>
                <ChevronRight size={17} />
              </button>
            ))
          ) : (
            kpdjpByLocation.map(({ name, location: loc }) => (
              <button
                key={`${loc}-${name}`}
                className="kpdjp-dashboard-card"
                onClick={() => openKpdjp(name, loc)}
              >
                <small>{loc}</small>
                <strong>{name}</strong>
                <span>{loc === "Jakarta" ? "Buka detail" : "Data belum tersedia"}</span>
                <ChevronRight size={17} />
              </button>
            ))
          )}
        </div>
      </section>

      <section className="reports-home-section">
        <div className="reports-home-heading">
          <h2>Daftar Laporan</h2>
        </div>
        <ReportList reports={reports} openReport={openReport} />
      </section>
    </div>
  );
}

/* =========================================================
   TECHNICIAN JOBS
========================================================= */

function TechnicianJobs({
  user,
  reports,
  openReport,
}) {

  const myJobs =
    reports.filter(
      (report) =>
        report.technician ===
        user.name
    );


  return (

    <div
      className="content"
    >

      <TopBar
        reports={reports}
        title="My Jobs"
        subtitle="TECHNICIAN / WORK QUEUE"
      />


      <section
        className="welcome"
      >

        <div>

          <small>
            TECHNICIAN
          </small>

          <h2>
            Jobs assigned to you.
          </h2>

          <p>
            Open a job and fill
            in the field report.
          </p>

        </div>


        <div
          className="quickStats"
        >

          <div>

            <b>
              {
                myJobs.length
              }
            </b>

            <span>
              My jobs
            </span>

          </div>

        </div>

      </section>


      <div
        className="jobCards"
      >

        {
          myJobs.map(
            (report) => (

              <button
                className="jobCard"
                key={
                  report.id
                }

                onClick={() =>
                  openReport(
                    report
                  )
                }
              >

                <div
                  className="jobIcon"
                >
                  <PenLine
                    size={15}
                  />
                </div>


                <small>
                  {report.type}
                </small>


                <h3>
                  {report.title}
                </h3>


                <p>
                  {report.client}
                </p>


                <div
                  className="jobBottom"
                >

                  <span
                    className="status"
                  >
                    {report.status}
                  </span>


                  <ChevronRight
                    size={14}
                  />

                </div>

              </button>

            )
          )
        }

      </div>

    </div>
  );
}


/* =========================================================
   REPORTS
========================================================= */

function Reports({
  user,
  reports,
  openReport,
  onNewReport,
}) {

  let visibleReports = reports;

  if (user.role === "User") {
    visibleReports =
      reports.filter(
        (report) =>
          report.technician === user.name
      );
  }

  if (user.role === "Client" || user.role === "Vendor") {
    visibleReports =
      reports.filter(
        (report) =>
          (report.client || report.vendor) === user.name
      );
  }

  return (
    <div className="content">
<TopBar
  title={
    user.role === "Admin"
      ? "Reports"
      : "My Reports"
  }
  subtitle="WORKSPACE / REPORTS"
  action={
    user.role === "Admin" && (
      <button
        type="button"
        className="darkButton"
        onClick={onNewReport}
      >
        <Plus size={14} />
        New Report
      </button>
    )
  }
/>

      <ReportList
        reports={visibleReports}
        openReport={openReport}
        isAdmin={user.role === "Admin"}
      />

    </div>
  );
}

/* =========================================================
   REPORT LIST
========================================================= */

function ReportList({
  reports,
  openReport,
  isAdmin = false,
}) {

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const statuses = [
    "All",
    ...Array.from(
      new Set(
        reports
          .map((report) => report.status)
          .filter(Boolean)
      )
    ),
  ];

  const filteredReports =
    reports.filter((report) => {

      const keyword =
        search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        [
          report.title,
          report.id,
          report.client,
          report.technician,
          report.type,
        ]
          .filter(Boolean)
          .some((value) =>
            value
              .toLowerCase()
              .includes(keyword)
          );

      const matchesStatus =
        statusFilter === "All" ||
        report.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  return (
    <div className="reportSection">

      <div className="reportToolbar">

        <div className="reportSearch">
          <Search size={15} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search reports..."
          />
        </div>

        <select
          className="reportFilter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          {statuses.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status === "All"
                ? "All statuses"
                : status}
            </option>
          ))}
        </select>

      </div>

      <div className="reportResultInfo">
        {filteredReports.length}{" "}
        {filteredReports.length === 1
          ? "report"
          : "reports"}
      </div>

      <div className="reportList">

        {filteredReports.map((report) => (

          <button
            type="button"
            className="reportRow"
            key={report.id}
            onClick={() =>
              openReport(report)
            }
          >

            <div className="fileIcon">
              <FileText size={14} />
            </div>

            <div className="reportMain">
              <b>{report.title}</b>

              <span>
                {report.client}
                {" · "}
                {report.id}
              </span>
            </div>

            <div className="reportTech">
              <small>TECHNICIAN</small>
              {report.technician || "-"}
            </div>

            <span className="status">
              {report.status}
            </span>

            <ChevronRight size={13} />

          </button>

        ))}

        {filteredReports.length === 0 && (
          <div className="empty">
            No reports found.
          </div>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   BACK BUTTON
========================================================= */

function BackButton({
  onClick,
  label = "Kembali",
}) {

  return (
    <button
      type="button"
      className="backButton"
      onClick={onClick}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}


/* =========================================================
   REPORT DETAIL
========================================================= */

function SharedReportFields({
  form,
  updateField,
  updateNestedField,
  readOnly = false,
}) {
  const Field = ({ label, field, type = "text" }) =>
    readOnly ? (
      <InfoRow
        label={label}
        value={form?.[field] || "-"}
      />
    ) : (
      <EditableField
        label={label}
        type={type}
        value={form?.[field] || ""}
        onChange={(value) => updateField(field, value)}
      />
    );

  const Select = ({ label, field, options }) =>
    readOnly ? (
      <InfoRow
        label={label}
        value={form?.[field] || "-"}
      />
    ) : (
      <SelectField
        label={label}
        value={form?.[field] || ""}
        options={options}
        onChange={(value) => updateField(field, value)}
      />
    );

  const measurementFields = [
    ["Input R-S", "inputVoltage", "rs"],
    ["Input S-T", "inputVoltage", "st"],
    ["Input T-R", "inputVoltage", "tr"],
    ["Input R-N", "inputVoltage", "rn"],
    ["Input S-N", "inputVoltage", "sn"],
    ["Input T-N", "inputVoltage", "tn"],
    ["Input Frequency", "inputVoltage", "frequency"],
    ["Output R-S", "outputVoltage", "rs"],
    ["Output S-T", "outputVoltage", "st"],
    ["Output T-R", "outputVoltage", "tr"],
    ["Output R-N", "outputVoltage", "rn"],
    ["Output S-N", "outputVoltage", "sn"],
    ["Output T-N", "outputVoltage", "tn"],
    ["Output Frequency", "outputVoltage", "frequency"],
    ["Input Current R", "inputCurrent", "r"],
    ["Input Current S", "inputCurrent", "s"],
    ["Input Current T", "inputCurrent", "t"],
    ["Output Current R", "outputCurrent", "r"],
    ["Output Current S", "outputCurrent", "s"],
    ["Output Current T", "outputCurrent", "t"],
  ];

  return (
    <>
      <InfoBlock title="Product">
        <Field label="Product" field="product" />
        <Field label="Model" field="model" />
        <Field label="Type / Form" field="typeForm" />
        <Field label="Serial Number" field="serialNumber" />
        <Field label="Battery Type" field="batteryType" />
        <Field label="Battery Quantity" field="batteryQuantity" type="number" />
      </InfoBlock>

      <InfoBlock title="Work & Environment">
        <Field label="Work Status" field="workStatus" />
        <Field label="Repair No." field="repairNo" />
        <Field label="Temperature (°C)" field="temperature" type="number" />

        <Select
          label="Ventilation"
          field="ventilation"
          options={["Good", "Fair", "Poor"]}
        />

        <Select
          label="Area Condition"
          field="areaCondition"
          options={["Clean", "Needs Cleaning", "Poor"]}
        />

        <Select
          label="Wiring"
          field="wiring"
          options={["Good", "Needs Attention", "Poor"]}
        />

        <Select
          label="Fan Rotation"
          field="fanRotation"
          options={["Good", "Fair", "Poor"]}
        />

        <Field label="Load Application" field="loadApplication" />
        <Field label="Parts Used" field="partsUsed" />
        <Field
          label="Replacement Recommended"
          field="partsReplacementRecommended"
        />
      </InfoBlock>

      <InfoBlock title="Measurements">
        {measurementFields.map(([label, group, field]) => {
          const value = form?.[group]?.[field] || "";

          return readOnly ? (
            <InfoRow
              key={`${group}-${field}`}
              label={label}
              value={value || "-"}
            />
          ) : (
            <EditableField
              key={`${group}-${field}`}
              label={label}
              value={value}
              onChange={(nextValue) =>
                updateNestedField(
                  group,
                  field,
                  nextValue
                )
              }
            />
          );
        })}

        <Field label="DC Bus Voltage" field="dcBusVoltage" />
        <Field label="Battery Charge Voltage" field="batteryChargeVoltage" />
        <Field label="Battery Total Voltage" field="batteryTotalVoltage" />
        <Field label="Battery Charge Current" field="batteryChargeCurrent" />
        <Field label="Ground Voltage" field="groundVoltage" />
        <Field label="Low Batteries" field="lowBatteries" />
      </InfoBlock>

      <InfoBlock title="Notes / Action Taken">
        {readOnly ? (
          <>
            <InfoRow
              label="Notes"
              value={form?.notes || "-"}
            />
            <InfoRow
              label="Other Actions"
              value={form?.actionsTaken?.others || "-"}
            />
          </>
        ) : (
          <>
            <textarea
              className="reportTextarea"
              value={form?.notes || ""}
              placeholder="Write notes..."
              onChange={(e) =>
                updateField("notes", e.target.value)
              }
            />

            <textarea
              className="reportTextarea"
              value={form?.actionsTaken?.others || ""}
              placeholder="Other actions taken..."
              onChange={(e) =>
                updateNestedField(
                  "actionsTaken",
                  "others",
                  e.target.value
                )
              }
            />
          </>
        )}
      </InfoBlock>
    </>
  );
}

function ReportDetail({
  report,
  user,
  updateReport,
  deleteReport,
  accounts = [],
  back,
}) {

  const [form, setForm] =
    useState(
      report.form || {
        ...emptyForm,
      }
    );

  const [signature, setSignature] =
    useState(
      report.technicianSignature ||
      ""
    );

  const [clearSignatureTrigger, setClearSignatureTrigger] =
    useState(0);

  const [clientSignature, setClientSignature] =
    useState(
      report.clientSignature ||
      ""
    );

  const [pdfPreviewUrl, setPdfPreviewUrl] =
    useState(
      ""
    );

  const [adminEditMode, setAdminEditMode] =
    useState(false);

  const [adminTitle, setAdminTitle] =
    useState(report.title || "");

  const [adminType, setAdminType] =
    useState(report.type || "Maintenance");

  const [adminDate, setAdminDate] =
    useState(report.date || "");

  const [adminTechnician, setAdminTechnician] =
    useState(report.technician || "");

  const [adminClient, setAdminClient] =
    useState(report.client || "");

  const [adminStatus, setAdminStatus] =
    useState(report.status || "Draft");

  /* =======================================================
     REPORT NAVIGATION
  ======================================================= */

  const goBack = () => {
    if (typeof back === "function") {
      back();
      return;
    }

    window.history.back();
  };

  /* =======================================================
     TECHNICIAN SIGNATURE
  ======================================================= */

  const signTechnician = async () => {

    if (!signature) {
      alert("Silakan tanda tangan terlebih dahulu.");
      return;
    }

    try {

      await updateReport({
        ...report,

        form,

        technicianSigned: true,

        technicianSignature: signature,

        technicianSignedAt: new Date(),

        status: "Waiting Vendor Signature",
      });

    } catch (error) {

      console.error(
        "Technician signature error:",
        error
      );

      alert(
        "Gagal menyimpan tanda tangan technician."
      );
    }
  };
    


  /* =======================================================
     UPDATE FORM FIELD
  ======================================================= */

  const updateField = (
    field,
    value
  ) => {

    setForm(
      (prev) => ({
        ...prev,
        [field]: value,
      })
    );
  };

  const updateNestedField =
    (group, field, value) => {

      setForm((prev) => ({
        ...prev,
        [group]: {
          ...(prev[group] || {}),
          [field]: value,
        },
      }));
    };


  const saveAdminChanges =
    async () => {

      await updateReport({
        ...report,

        title: adminTitle.trim() ||
          report.title,

        type: adminType,

        date: adminDate,

        technician:
          adminTechnician,

        client:
          adminClient,

        status:
          adminStatus,

        form,
      });

      setAdminEditMode(false);

    };


  const resetSignature =
    async (role) => {

      const isTechnician =
        role === "technician";

      const confirmed =
        window.confirm(
          isTechnician
            ? "Hapus tanda tangan technician agar bisa ditandatangani ulang?"
            : "Hapus tanda tangan client agar client bisa menandatangani ulang?"
        );

      if (!confirmed) {
        return;
      }

      const next = {
        ...report,
      };

      if (isTechnician) {

        next.technicianSigned = false;
        next.technicianSignature = "";
        next.technicianSignedAt = null;

        next.status =
          next.clientSigned
            ? "Waiting Technician Signature"
            : "In Progress";

      } else {

        next.clientSigned = false;
        next.clientSignature = "";
        next.clientSignedAt = null;

        next.status =
          next.technicianSigned
            ? "Waiting Vendor Signature"
            : "In Progress";
      }

      await updateReport(next);

      setSignature(
        next.technicianSignature || ""
      );

      setClientSignature(
        next.clientSignature || ""
      );

    };


  /* =======================================================
     GENERATE PDF
  ======================================================= */

  const previewPDF =
    async () => {

      try {

        if (pdfPreviewUrl) {
          URL.revokeObjectURL(pdfPreviewUrl);
          setPdfPreviewUrl("");
        }

        const url =
          await generateReportPDF({

            ...report,

            form,

            technicianSignature:
              signature ||
              report.technicianSignature ||
              "",

            clientSignature:
              clientSignature ||
              report.clientSignature ||
              "",

            openInNewTab: true,

          });

        if (url) {
          setPdfPreviewUrl(url);
        }

      } catch (error) {

        console.error(
          "PDF preview error:",
          error
        );

        alert(
          "Gagal menampilkan PDF."
        );
      }
    };

  const closePDFPreview = () => {

    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }

    setPdfPreviewUrl("");
  };

  const downloadPDF =
    async () => {

      try {

        await generateReportPDF({

          ...report,

          form,

          technicianSignature:
            signature ||
            report.technicianSignature ||
            "",

          clientSignature:
            clientSignature ||
            report.clientSignature ||
            "",

        });

      } catch (error) {

        console.error(
          "PDF error:",
          error
        );

        alert(
          "Gagal membuat PDF."
        );
      }
    };


  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  const saveDraft =
    async () => {

      await updateReport({

        ...report,

        form,

        status:
          "In Progress",

      });
    };


  /* =======================================================
     SUBMIT REPORT
  ======================================================= */

  const submitReport =
    async () => {

      if (!report?.id) {
        alert(
          "Report tidak memiliki ID."
        );
        return;
      }

      try {

        await generateReportPDF({

          ...report,

          form,

          technicianSignature:
            signature ||
            report.technicianSignature ||
            "",

          clientSignature:
            clientSignature ||
            report.clientSignature ||
            "",

        });

        await updateReport({

          ...report,

          form,

          status:
            "Submitted",

        });

      } catch (error) {

        console.error(
          "Submit report error:",
          error
        );

        alert(
          "Gagal submit report atau download PDF."
        );
      }
    };


  /* =======================================================
     TECHNICIAN
  ======================================================= */

  if (
    user.role ===
    "User"
  ) {

    /* -----------------------------------------------------
       TECHNICIAN SIGNATURE PAGE
    ----------------------------------------------------- */

    if (
  report.status === "Waiting Technician Signature"
) {

      return (

        <div
          className="content"
        >

          <BackButton
            onClick={goBack}
            label="Kembali ke My Jobs"
          />


          <div
            className="signaturePage"
          >

            <div
              className="signatureHeader"
            >

              <small>
                TECHNICIAN SIGNATURE
              </small>

              <h1>
                Sign your report
              </h1>

              <p>
                Review the report before
                submitting your signature.
              </p>

            </div>


            <div
              className="signatureReportInfo"
            >

              <div>

                <small>
                  REPORT
                </small>

                <b>
                  {report.id}
                </b>

              </div>


              <div>

                <small>
                  JOB
                </small>

                <b>
                  {report.title}
                </b>

              </div>


              <div>

                <small>
                  VENDOR
                </small>

                <b>
                  {report.client}
                </b>

              </div>

            </div>


            <SignaturePad
              value={
                signature
              }

              setValue={
                setSignature
              }

              clearTrigger={
                clearSignatureTrigger
              }
            />


            <div
              className="signatureActions"
            >

              <button
                type="button"
                className="saveButton"
                onClick={() => {
                  setSignature("");
                  setClearSignatureTrigger(
                    (prev) => prev + 1
                  );
                }}
              >
                Clear
              </button>


              <button
                className="darkButton"
                onClick={
                  signTechnician
                }
              >

                <PenLine
                  size={14}
                />

                Sign Report

              </button>

            </div>

          </div>

        </div>
      );
    }


    /* -----------------------------------------------------
       QR PAGE
    ----------------------------------------------------- */

    if (
      false &&
      report.status ===
      "Waiting Vendor Signature"
    ) {

     const signUrl =
  getSignUrl("client", report.id);


      return (

        <div
          className="content"
        >

          <BackButton
            onClick={goBack}
            label="Kembali ke My Jobs"
          />


          <div
            className="signatureSuccess"
          >

            <div
              className="successIcon"
            >
              ✓
            </div>


            <small>
              TECHNICIAN SIGNED
            </small>


            <h1>
              Report ready for client
            </h1>


            <p>
              Ask the client to scan
              this QR code.
            </p>


            <div
              className="qrCard"
            >

              <QRCodeCanvas
                value={
                  signUrl
                }

                size={210}

                includeMargin
              />


              <b>
                Scan to review & sign
              </b>


              <span>
                {report.id}
              </span>

            </div>


            <div
              className="qrActions"
            >

              <button
                className="pdfButton"
                onClick={
                  downloadPDF
                }
              >

                <FileText
                  size={14}
                />

                Generate PDF

              </button>

            </div>


            <div
              className="signatureStatus"
            >

              <div>

                <span>
                  ✓
                </span>

                Report submitted

              </div>


              <div>

                <span>
                  ✓
                </span>

                Technician signed

              </div>


              <div
                className="waiting"
              >

                <span>
                  ○
                </span>

                Waiting for client

              </div>

            </div>

          </div>

        </div>
      );
    }


    /* -----------------------------------------------------
       COMPLETED PAGE
    ----------------------------------------------------- */

    if (
      false &&
      report.status ===
      "Completed"
    ) {

      return (

        <div
          className="content"
        >

          <BackButton
            onClick={goBack}
            label="Kembali ke My Jobs"
          />


          <div
            className="signatureSuccess"
          >

            <div
              className="successIcon"
            >
              ✓
            </div>


            <small>
              COMPLETED
            </small>


            
          </div>

        </div>
      );
    }


    /* -----------------------------------------------------
       TECHNICIAN FORM
    ----------------------------------------------------- */

    return (

      <div
        className="content"
      >

        <BackButton
          onClick={goBack}
          label="Kembali ke My Jobs"
        />


        <div
          className="reportHero"
        >

          <div>

            <small>
              {report.id}
              {" · "}
              {report.type}
            </small>


            <h1>
              {report.title}
            </h1>


            <p>
              {report.client}
            </p>

          </div>


          <span
            className="status"
          >
            {report.status}
          </span>

        </div>


        {/* =================================================
            JOB INFORMATION
        ================================================= */}

        <InfoBlock
          title="Job Information"
        >

          <InfoRow
            label="Report ID"
            value={
              report.id
            }
          />


          <InfoRow
            label="Technician"
            value={
              report.technician
            }
          />


          <InfoRow
            label="Vendor"
            value={
              report.client
            }
          />


          <InfoRow
            label="Work Date"
            value={
              report.date
            }
          />

        </InfoBlock>


        <SharedReportFields
          form={form}
          updateField={updateField}
          updateNestedField={updateNestedField}
        />

        {/* =================================================
            DIGITAL SIGNATURES
        ================================================= */}

        <InfoBlock
          title="Digital Signatures"
        >

          <div
            className="signatureQrGrid"
          >

            <div
              className="signatureQrCard"
            >

              <div
                className="signatureQrTitle"
              >
                <span>Technician</span>
              </div>

              {report.technicianSigned &&
              report.technicianSignature ? (

                <img
                  className="signatureImage"
                  src={
                    report.technicianSignature
                  }
                  alt="Technician signature"
                />

              ) : (

                <QRCodeCanvas
                  value={
                    getSignUrl("technician", report.id)
                  }
                  size={150}
                  includeMargin
                />

              )}

              
                <p>
  {report.technician || "-"}
</p>

            </div>


            <div
              className="signatureQrCard"
            >

              <div
                className="signatureQrTitle"
              >
                <span>Vendor</span>
              </div>

              {report.clientSigned &&
              report.clientSignature ? (

                <img
                  className="signatureImage"
                  src={
                    report.clientSignature
                  }
                  alt="Vendor signature"
                />

              ) : (

                <QRCodeCanvas
                  value={
                    getSignUrl("client", report.id)
                  }
                  size={150}
                  includeMargin
                />

              )}

              <p>
                {report.client || "-"}
              </p>

            </div>

          </div>

        </InfoBlock>


        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div
          className="reportFormActions"
        >

          <button
            type="button"
            className="saveButton"
            onClick={
              saveDraft
            }
          >

            <Save
              size={13}
            />

            Save Draft

          </button>


          <button
            type="button"
            className="pdfButton"
            onClick={
              previewPDF
            }
          >

            <Eye
              size={13}
            />

            Preview PDF

          </button>


          <button
            type="button"
            className="darkButton"
            onClick={
              submitReport
            }
          >

            <Send
              size={13}
            />

            Submit Report

          </button>

        </div>

        {pdfPreviewUrl && (

          <div
            className="pdfPreviewOverlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closePDFPreview();
              }
            }}
          >

            <div className="pdfPreviewModal">

              <div className="pdfPreviewHeader">

                <div>
                  <small>PDF PREVIEW</small>
                  <h2>{report.title || "Report"}</h2>
                </div>

                <button
                  type="button"
                  className="pdfPreviewClose"
                  onClick={closePDFPreview}
                  aria-label="Close PDF preview"
                >
                  ×
                </button>

              </div>

              <iframe
                className="pdfPreviewFrame"
                src={pdfPreviewUrl}
                title="PDF Preview"
              />

            </div>

          </div>

        )}

      </div>
    );
  }


  /* =======================================================
     VENDOR
  ======================================================= */

  if (
    user.role ===
    "Client"
  ) {

    return (

      <div
        className="content"
      >

        <button
          className="backButton"
          onClick={
            goBack
          }
        >
          ← Back
        </button>


        <div
          className="reportHero"
        >

          <div>

            <small>
              {report.id}
              {" · "}
              {report.type}
            </small>


            <h1>
              {report.title}
            </h1>


            <p>
              {report.client}
            </p>

          </div>


          <span
            className="status"
          >
            {report.status}
          </span>

        </div>


        {/* =================================================
            CLIENT REPORT VIEW
        ================================================= */}

        <InfoBlock
          title="Report Details"
        >

          <InfoRow
            label="Report ID"
            value={
              report.id
            }
          />


          <InfoRow
            label="Technician"
            value={
              report.technician
            }
          />


          <InfoRow
            label="Product"
            value={
              report.form?.product ||
              "-"
            }
          />


          <InfoRow
            label="Model"
            value={
              report.form?.model ||
              "-"
            }
          />


          <InfoRow
            label="Serial Number"
            value={
              report.form?.serialNumber ||
              "-"
            }
          />


          <InfoRow
            label="Temperature"
            value={
              report.form?.temperature
                ? `${report.form.temperature} °C`
                : "-"
            }
          />


          <InfoRow
            label="Ventilation"
            value={
              report.form?.ventilation ||
              "-"
            }
          />


          <InfoRow
            label="Area Condition"
            value={
              report.form?.areaCondition ||
              "-"
            }
          />


          <InfoRow
            label="Wiring"
            value={
              report.form?.wiring ||
              "-"
            }
          />


          <InfoRow
            label="Notes"
            value={
              report.form?.notes ||
              "-"
            }
          />

        </InfoBlock>


        {/* =================================================
            CLIENT SIGNATURE
        ================================================= */}

        {
          !report.clientSigned
            ? (

              <div
                className="clientSignatureArea"
              >

                <small>
                  VENDOR APPROVAL
                </small>


                <h2>
                  Sign this report
                </h2>


                <p>
                  Review the report and
                  provide your signature.
                </p>


                <SignaturePad
                  value={
                    clientSignature
                  }

                  setValue={
                    setClientSignature
                  }
                />


                <button
                  className="darkButton"
                  onClick={
                    signClient
                  }
                >

                  <PenLine
                    size={14}
                  />

                  Approve & Sign

                </button>

               </div>

            )
            : (

              <div className="clientQrOnly">

                <QRCodeCanvas
                  value={
                    getSignUrl("client", report.id)
                  }
                  size={180}
                  includeMargin
                />

              </div>

            )
        }

      </div>
    );
  }
      

  /* =======================================================
     ADMIN REPORT VIEW
  ======================================================= */

  if (user.role === "Admin") {

    return (
      <div className="content">

        <button
          className="backButton"
          onClick={goBack}
        >
          ← Back to Reports
        </button>

        <div className="reportHero">

          <div>
            <small>
              {report.id}
              {" · "}
              {report.type}
            </small>

            <h1>
              {report.title}
            </h1>

            <p>
              {report.client}
            </p>
          </div>

          <span className="status">
            {report.status}
          </span>

        </div>

        {!adminEditMode ? (

          <>
            <InfoBlock title="Report Information">

              <InfoRow
                label="Report ID"
                value={report.id}
              />

              <InfoRow
                label="Title"
                value={report.title}
              />

              <InfoRow
                label="Type"
                value={report.type}
              />

              <InfoRow
                label="Work Date"
                value={report.date}
              />

              <InfoRow
                label="Technician"
                value={report.technician}
              />

              <InfoRow
                label="Vendor"
                value={report.client}
              />

            </InfoBlock>

            <InfoBlock title="Workflow">

              <InfoRow
                label="Technician Signature"
                value={
                  report.technicianSigned
                    ? "Signed ✓"
                    : "Not signed"
                }
              />

              <InfoRow
                label="Vendor Signature"
                value={
                  report.clientSigned
                    ? "Signed ✓"
                    : "Waiting"
                }
              />

              <InfoRow
                label="Status"
                value={report.status}
              />

            </InfoBlock>

            <SharedReportFields
              form={form}
              updateField={updateField}
              updateNestedField={updateNestedField}
              readOnly
            />

            <InfoBlock title="Digital Signatures">

              <div className="signatureQrGrid">

                <div className="signatureQrCard">

                  <div className="signatureQrTitle">
                    <span>Technician</span>

                      </div>

                  {report.technicianSigned &&
                  report.technicianSignature ? (

                    <img
                      className="signatureImage"
                      src={
                        report.technicianSignature
                      }
                      alt="Technician signature"
                    />

                  ) : (

                    <QRCodeCanvas
                      value={
                        getSignUrl("technician", report.id)
                      }
                      size={150}
                      includeMargin
                    />

                  )}

                  <p>
                    {report.technician || "-"}
                  </p>

                  {report.technicianSigned && (
                    <button
                      type="button"
                      className="signatureResetButton"
                      onClick={() =>
                        resetSignature(
                          "technician"
                        )
                      }
                    >
                      Reset Technician Signature
                    </button>
                  )}

                </div>

                <div className="signatureQrCard">

                  <div className="signatureQrTitle">
                    <span>Vendor</span>

                      </div>

                  {report.clientSigned &&
                  report.clientSignature ? (

                    <img
                      className="signatureImage"
                      src={
                        report.clientSignature
                      }
                      alt="Vendor signature"
                    />

                  ) : (

                    <QRCodeCanvas
                      value={
                        getSignUrl("client", report.id)
                      }
                      size={150}
                      includeMargin
                    />

                  )}

                  <p>
                    {report.client || "-"}
                  </p>

                  {report.clientSigned && (
                    <button
                      type="button"
                      className="signatureResetButton"
                      onClick={() =>
                        resetSignature(
                          "client"
                        )
                      }
                    >
                      Reset Vendor Signature
                    </button>
                  )}

                </div>

              </div>

            </InfoBlock>

            <div className="adminReportActions">

              <button
                className="saveButton"
                onClick={() =>
                  setAdminEditMode(true)
                }
              >
                <Pencil size={14} />
                Edit Report
              </button>

              <button
                className="pdfButton"
                onClick={downloadPDF}
              >
                <Download size={14} />
                Download PDF
              </button>

              <button
                className="deleteReportButton"
                onClick={() =>
                  deleteReport(
                    report.id
                  )
                }
              >
                <Trash2 size={14} />
                Delete Report
              </button>

            </div>

          </>

        ) : (

          <>

            <InfoBlock title="Edit Report">

              <div className="adminEditGrid">

                <EditableField
                  label="Report Title"
                  value={adminTitle}
                  onChange={setAdminTitle}
                />

                <SelectField
                  label="Template / Type"
                  value={adminType}
                  options={[
                    "Maintenance",
                    "Inspection",
                    "Repair",
                  ]}
                  onChange={setAdminType}
                />

                <EditableField
                  label="Work Date"
                  value={adminDate}
                  onChange={setAdminDate}
                />

                <SelectField
                  label="Technician"
                  value={adminTechnician}
                  options={
                    accounts
                      .filter(
                        (account) =>
                          account.role === "User"
                      )
                      .map(
                        (account) =>
                          account.name
                      )
                      .concat(
                        adminTechnician &&
                        !accounts.some(
                          (account) =>
                            account.role === "User" &&
                            account.name ===
                              adminTechnician
                        )
                          ? [adminTechnician]
                          : []
                      )
                  }
                  onChange={setAdminTechnician}
                />

                <SelectField
                  label="Vendor"
                  value={adminClient}
                  options={
                    accounts
                      .filter(
                        (account) =>
                          (account.role === "Client" || account.role === "Vendor")
                      )
                      .map(
                        (account) =>
                          account.name
                      )
                      .concat(
                        adminClient &&
                        !accounts.some(
                          (account) =>
                            (account.role === "Client" || account.role === "Vendor") &&
                            account.name ===
                              adminClient
                        )
                          ? [adminClient]
                          : []
                      )
                  }
                  onChange={setAdminClient}
                />

                <SelectField
                  label="Status"
                  value={adminStatus}
                  options={[
                    "Draft",
                    "In Progress",
                    "Submitted",
                    "Waiting Technician Signature",
                    "Waiting Vendor Signature",
                    "Completed",
                  ]}
                  onChange={setAdminStatus}
                />

              </div>

            </InfoBlock>

            <SharedReportFields
              form={form}
              updateField={updateField}
              updateNestedField={updateNestedField}
            />

            <div className="adminReportActions">

              <button
                className="saveButton"
                onClick={() =>
                  setAdminEditMode(false)
                }
              >
                Cancel
              </button>

              <button
                className="darkButton"
                onClick={saveAdminChanges}
              >
                <Save size={14} />
                Save Changes
              </button>

              <button
                className="pdfButton"
                onClick={downloadPDF}
              >
                <Download size={14} />
                Download PDF
              </button>

            </div>

          </>

        )}

      </div>
    );
  }

  }


/* =========================================================
   SIGNATURE PAD
========================================================= */

function SignaturePad({
  value,
  setValue,
  clearTrigger = 0,
}) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }, [clearTrigger]);

  const getCanvasPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX =
      canvas.width / rect.width;

    const scaleY =
      canvas.height / rect.height;

    return {
      x:
        (event.clientX - rect.left) *
        scaleX,

      y:
        (event.clientY - rect.top) *
        scaleY,
    };
  };


  const startDrawing = (event) => {
    event.preventDefault();

    const canvas =
      canvasRef.current;

    const ctx =
      canvas.getContext("2d");

    const position =
      getCanvasPosition(event);

    drawingRef.current = true;

    ctx.beginPath();

    ctx.moveTo(
      position.x,
      position.y
    );
  };


  const draw = (event) => {
    event.preventDefault();

    if (
      !drawingRef.current
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    const ctx =
      canvas.getContext("2d");

    const position =
      getCanvasPosition(event);

    ctx.lineWidth = 2.5;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";

    ctx.strokeStyle = "#111";

    ctx.lineTo(
      position.x,
      position.y
    );

    ctx.stroke();
  };


  const stopDrawing = (event) => {
    event?.preventDefault();

    if (
      !drawingRef.current
    ) {
      return;
    }

    drawingRef.current = false;

    const canvas =
      canvasRef.current;

    setValue(
      canvas.toDataURL(
        "image/png"
      )
    );
  };


  const clearSignature = () => {
    const canvas =
      canvasRef.current;

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setValue("");
  };


  return (
    <div className="signaturePad">

      <div className="signaturePadHeader">

        <div>
          <small>
            SIGNATURE
          </small>

          <b>
            Draw your signature below
          </b>
        </div>

      </div>


      <div className="signatureCanvasWrap">

        <canvas
          ref={canvasRef}

          width={900}
          height={300}

          onPointerDown={
            startDrawing
          }

          onPointerMove={
            draw
          }

          onPointerUp={
            stopDrawing
          }

          onPointerLeave={
            stopDrawing
          }

          onPointerCancel={
            stopDrawing
          }

          style={{
            touchAction: "none",
          }}
        />

        <div className="signatureLine" />

      </div>


      <small className="signatureHint">
        Use your mouse, trackpad,
        or touchscreen to sign.
      </small>

    </div>
  );
}

  
/* =========================================================
   CLIENT QR SIGNING PAGE
========================================================= */

function ClientSigningPage({
  reportId,
  role,
}) {

  const [report, setReport] =
    useState(null);

  const [signature, setSignature] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const isTechnician =
    role === "technician";

  const isClient =
    role === "client" ||
    role === "vendor";

  useEffect(() => {

    const loadReport = async () => {

      try {

        const snapshot =
          await getDoc(
            doc(
              db,
              "reports",
              reportId
            )
          );

        if (!snapshot.exists()) {
          setReport(null);
          return;
        }

        setReport({
          id: snapshot.id,
          ...snapshot.data(),
        });

      } catch (error) {

        console.error(
          "Load signing report error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    if (reportId) {
      loadReport();
    }

  }, [reportId]);


  const submitSignature = async () => {

    if (!signature) {

      alert(
        "Silakan tanda tangan terlebih dahulu."
      );

      return;
    }

    if (!isTechnician && !isClient) {

      alert(
        "Link tanda tangan tidak valid."
      );

      return;
    }

    try {

      setSaving(true);

      const nextTechnicianSigned =
        isTechnician
          ? true
          : Boolean(
              report.technicianSigned
            );

      const nextClientSigned =
        isClient
          ? true
          : Boolean(
              report.clientSigned
            );

      let nextStatus =
        "In Progress";

      if (
        nextTechnicianSigned &&
        nextClientSigned
      ) {
        nextStatus =
          "Completed";
      } else if (
        nextTechnicianSigned
      ) {
        nextStatus =
          "Waiting Vendor Signature";
      } else if (
        nextClientSigned
      ) {
        nextStatus =
          "Waiting Technician Signature";
      } else {
        nextStatus =
          "Submitted";
      }

      const updates = {

        status:
          nextStatus,

        technicianSigned:
          nextTechnicianSigned,

        clientSigned:
          nextClientSigned,
      };

      if (isTechnician) {

        updates.technicianSignature =
          signature;

        updates.technicianSignedAt =
          new Date();

      }

      if (isClient) {

        updates.clientSignature =
          signature;
        updates.vendorSignature =
          signature;

        updates.clientSignedAt =
          new Date();
        updates.vendorSignedAt =
          new Date();
        updates.vendorSigned =
          true;

      }

      await updateDoc(
        doc(
          db,
          "reports",
          reportId
        ),
        updates
      );

      setReport((prev) => ({
        ...prev,
        ...updates,
      }));

    } catch (error) {

      console.error(
        "Signature error:",
        error
      );

      alert(
        "Gagal menyimpan tanda tangan."
      );

    } finally {

      setSaving(false);

    }

  };


  if (loading) {

    return (
      <div className="clientSignPage">
        <div className="clientSignCard">
          <h2>Loading report...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );

  }


  if (!report) {

    return (
      <div className="clientSignPage">
        <div className="clientSignCard">
          <h2>Report not found</h2>
          <p>Report tidak ditemukan.</p>
        </div>
      </div>
    );

  }


  const alreadySigned =
    isTechnician
      ? report.technicianSigned
      : isClient
        ? report.clientSigned
        : false;

  if (alreadySigned) {

    return (
      <div className="clientSignPage">

        <div className="clientSignCard">

          <div className="successIcon">
            ✓
          </div>

          <small>
            {isTechnician
              ? "TECHNICIAN SIGNED"
              : "CLIENT SIGNED"}
          </small>

          <h1>
            Signature recorded
          </h1>

          <p>
            Tanda tangan sudah tersimpan
            untuk report ini.
          </p>

        </div>

      </div>
    );

  }


  return (

    <div className="clientSignPage">

      <div className="clientSignCard">

        <small>
          {isTechnician
            ? "TECHNICIAN APPROVAL"
            : "VENDOR APPROVAL"}
        </small>

        <h1>
          Review & Sign
        </h1>

        <p>
          Review this report before
          submitting your signature.
        </p>

        <div className="clientReportInfo">

          <div>
            <small>REPORT</small>
            <b>{report.id}</b>
          </div>

          <div>
            <small>JOB</small>
            <b>{report.title}</b>
          </div>

          <div>
            <small>TECHNICIAN</small>
            <b>{report.technician || "-"}</b>
          </div>

          <div>
            <small>CLIENT</small>
            <b>{report.client || "-"}</b>
          </div>

        </div>

        <SignaturePad
          value={signature}
          setValue={setSignature}
        />

        <button
          className="signSubmit"
          onClick={submitSignature}
          disabled={saving}
        >

          <PenLine size={15} />

          {saving
            ? "Saving..."
            : isTechnician
              ? "Sign as Technician"
              : "Approve & Sign"}

        </button>

      </div>

    </div>

  );

}

/* =========================================================
   EDITABLE FIELD
========================================================= */

function EditableField({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="editableField">
      <label className="fieldLabel">
        <span className="fieldLabelText">
          {label}
        </span>

        <input
          type={type}
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
        />
      </label>
    </div>
  );
}
/* =========================================================
   SELECT FIELD
========================================================= */
function SelectField({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <div className="editableField">
      <label className="fieldLabel">
        <span className="fieldLabelText">
          {label}
        </span>

        <select
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
/* =========================================================
   INFO BLOCK
========================================================= */

function InfoBlock({
  title,
  children,
}) {
  return (
    <section className="infoBlock">
      <div className="infoBlockHeader">
        <h2>{title}</h2>
      </div>

      <div className="infoBlockBody">
        {children}
      </div>
    </section>
  );
}
/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="infoRow">

      <small>
        {label}
      </small>

      <b>
        {value}
      </b>

    </div>
  );
}


/* =========================================================
   USERS / TECHNICIANS
   HANYA ADMIN YANG BISA TAMBAH
========================================================= */

function UsersPage({
  accounts,
  openAdd,
  openEdit,
  onDelete,
}) {

  const technicians =
    accounts.filter(
      (account) =>
        account.role === "User"
    );

  const admins =
    accounts.filter(
      (account) =>
        account.role === "Admin"
    );

  const [search, setSearch] =
    useState("");

  const visibleTechnicians =
    technicians.filter((account) =>
      `${account.name} ${account.email}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const visibleAdmins =
    admins.filter((account) =>
      `${account.name} ${account.email}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="content">

      <TopBar
        title="Team"
        subtitle="ADMIN / USERS"
        action={
          <div className="topActions">
            <button
              className="saveButton"
              onClick={() =>
                openAdd("Admin")
              }
            >
              <UserPlus size={14} />
              Add Admin
            </button>

            <button
              className="darkButton"
              onClick={() =>
                openAdd("User")
              }
            >
              <UserPlus size={14} />
              Add Technician
            </button>
          </div>
        }
      />

      <div className="adminPageToolbar">

        <div className="adminSearch">
          <Search size={14} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search team..."
          />
        </div>

      </div>

      <div className="sectionHeader">
        <small>TEAM</small>
        <h2>Technician accounts</h2>
        <p>
          Admin can create, edit, and remove technician accounts.
        </p>
      </div>

      <div className="userList">

        {visibleTechnicians.map(
          (account) => (

            <div
              className="userRow"
              key={account.id}
            >

              <div className="avatar">
                {account.name.charAt(0)}
              </div>

              <div className="userMain">
                <b>{account.name}</b>
                <span>{account.email}</span>
              </div>

              <span className="roleBadge">
                Technician
              </span>

              <div className="rowActions">

                <button
                  type="button"
                  onClick={() =>
                    openEdit(account)
                  }
                >
                  <Pencil size={13} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDelete(account)
                  }
                >
                  <Trash2 size={13} />
                </button>

              </div>

            </div>

          )
        )}

        {visibleTechnicians.length === 0 && (
          <div className="empty">
            Belum ada technician.
          </div>
        )}

      </div>

      <div
        className="sectionHeader"
        style={{ marginTop: "28px" }}
      >
        <small>ADMINISTRATORS</small>
        <h2>Admin accounts</h2>
        <p>
          Admin can manage administrator access from here.
        </p>
      </div>

      <div className="userList">

        {visibleAdmins.map(
          (account) => (

            <div
              className="userRow"
              key={account.id}
            >

              <div className="avatar">
                {account.name.charAt(0)}
              </div>

              <div className="userMain">
                <b>{account.name}</b>
                <span>{account.email}</span>
              </div>

              <span className="roleBadge">
                Admin
              </span>

              <div className="rowActions">

                <button
                  type="button"
                  onClick={() =>
                    openEdit(account)
                  }
                >
                  <Pencil size={13} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDelete(account)
                  }
                >
                  <Trash2 size={13} />
                </button>

              </div>

            </div>

          )
        )}

        {visibleAdmins.length === 0 && (
          <div className="empty">
            Belum ada admin tambahan.
          </div>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   CLIENTS
========================================================= */

function VendorsPage({
  accounts,
  openAdd,
  openEdit,
  onDelete,
}) {

  const vendors =
    accounts.filter(
      (account) =>
        (account.role === "Client" || account.role === "Vendor")
    );

  const [search, setSearch] =
    useState("");

  const visible =
    vendors.filter((account) =>
      `${account.name} ${account.email}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="content">

      <TopBar
        title="Vendors"
        subtitle="ADMIN / VENDORS"
        action={
          <button
            className="darkButton"
            onClick={openAdd}
          >
            <UserPlus size={14} />
            Add Vendor
          </button>
        }
      />

      <div className="adminPageToolbar">

        <div className="adminSearch">
          <Search size={14} />
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search vendors..."
          />
        </div>

      </div>

      <div className="sectionHeader">
        <small>VENDORS</small>
        <h2>Vendor accounts</h2>
        
      </div>

      <div className="userList">

        {visible.map((vendor) => (

          <div
            className="userRow"
            key={vendor.id}
          >

            <div className="vendorIcon">
              <Building2 size={17} />
            </div>

            <div className="userMain">
              <b>{vendor.name}</b>
              <span>{vendor.email}</span>
            </div>

            <span className="roleBadge">
              Vendor
            </span>

            <div className="rowActions">

              <button
                type="button"
                onClick={() =>
                  openEdit(vendor)
                }
                aria-label="Edit vendor"
              >
                <Pencil size={13} />
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(vendor)
                }
                aria-label="Delete vendor"
              >
                <Trash2 size={13} />
              </button>

            </div>

          </div>

        ))}

        {visible.length === 0 && (
          <div className="empty">
            Belum ada vendor.
          </div>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   TEMPLATES
========================================================= */

function TemplatesPage({
  templates,
  openAdd,
  openEdit,
  onDelete,
}) {

  const [selectedTemplate, setSelectedTemplate] =
    useState(null);

  const openTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const closeTemplate = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="content">

      <TopBar
        title="Templates"
        subtitle="ADMIN / TEMPLATES"
        action={
          <button
            type="button"
            className="darkButton"
            onClick={openAdd}
          >
            <Plus size={14} />
            Add Template
          </button>
        }
      />

      <div className="sectionHeader">
        <small>REPORT TEMPLATES</small>
        <h2>Field report templates</h2>
        
      </div>

      <div className="templateGrid">

        {templates.map((template) => (

          <div
            className="templateCard"
            key={template.id}
          >

            <div className="templateIcon">
              <ClipboardList size={17} />
            </div>

            <small>
              {template.category}
            </small>

            <h3>
              {template.name}
            </h3>

            <span>
              {template.fields} fields
            </span>

            <div className="templateActions">

              <button
                type="button"
                className="templateOpenButton"
                onClick={() => openTemplate(template)}
              >
                <Eye size={13} />
                Open
              </button>

              <button
                type="button"
                className="templateButton"
                onClick={() => openEdit(template)}
              >
                <Pencil size={13} />
                Edit
              </button>

              <button
                type="button"
                className="templateDeleteButton"
                onClick={() => onDelete(template)}
              >
                <Trash2 size={13} />
                Delete
              </button>

            </div>

          </div>

        ))}

        {templates.length === 0 && (
          <div className="empty">
            Belum ada template.
          </div>
        )}

      </div>

      {selectedTemplate && (

        <div
          className="modalBg"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeTemplate();
            }
          }}
        >

          <div className="modal templateViewModal">

            <button
              type="button"
              className="modalClose"
              onClick={closeTemplate}
            >
              <X size={17} />
            </button>

            <small>
              {selectedTemplate.category}
            </small>

            <h2>
              {selectedTemplate.name}
            </h2>

            <p className="templateViewDescription">
              Template ID: <b>{selectedTemplate.id}</b>
            </p>

            <div className="templateFieldHeader">
              <b>Template information</b>
              <span>
                {selectedTemplate.fields} fields
              </span>
            </div>

            <div className="templateFieldList">
              <div className="templateFieldItem">
                <span className="templateCheck">✓</span>
                <span>
                  This template is configured with {selectedTemplate.fields} report fields.
                </span>
              </div>
            </div>

            <div className="modalActions">

              <button
                type="button"
                className="saveButton"
                onClick={closeTemplate}
              >
                Close
              </button>

              <button
                type="button"
                className="darkButton"
                onClick={() => {
                  closeTemplate();
                  openEdit(selectedTemplate);
                }}
              >
                <Pencil size={14} />
                Edit Template
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   ACCOUNT PAGE
========================================================= */

function AccountPage({
  user,
  onSave,
}) {

  const [editing, setEditing] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [name, setName] =
    useState(user.name || "");

  const [email, setEmail] =
    useState(user.email || "");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  useEffect(() => {
    setName(user.name || "");
    setEmail(user.email || "");
  }, [user]);


  const submit = (e) => {

    e.preventDefault();

    onSave({
      name,
      email,
    });

    setEditing(false);
  };


  const submitPassword = (e) => {

    e.preventDefault();

    const storedPassword =
      user.password || "bebas";

    if (
      currentPassword !==
      storedPassword
    ) {
      alert(
        "Sandi saat ini salah."
      );
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "Sandi baru minimal 6 karakter."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      alert(
        "Konfirmasi sandi tidak cocok."
      );
      return;
    }

    onSave({
      name: user.name,
      email: user.email,
      password: newPassword,
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangingPassword(false);

    alert(
      "Sandi berhasil diubah."
    );
  };


  return (
    <div className="content">

      <TopBar
        title="Account"
        subtitle="SETTINGS / ACCOUNT"
      />

      <div className="accountHero">

        <div className="accountAvatar">
          {user.name?.charAt(0) || "A"}
        </div>

        <div>
          <small>ACCOUNT</small>
          <h2>{user.name}</h2>
          <p>{user.role}</p>
        </div>

        <div className="accountHeroActions">

          <button
            type="button"
            className="saveButton"
            onClick={() => setChangingPassword(true)}
          >
            <Save size={14} />
            Ubah Sandi
          </button>

          <button
            type="button"
            className="saveButton"
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} />
            Edit Profile
          </button>

        </div>

      </div>

      {!editing && !changingPassword ? (

        <InfoBlock title="Profile">

          <InfoRow
            label="Name"
            value={user.name}
          />

          <InfoRow
            label="Email"
            value={user.email}
          />

          <InfoRow
            label="Role"
            value={user.role}
          />

        </InfoBlock>

      ) : editing ? (

        <section className="infoBlock">

          <div className="infoBlockHeader">
            <h2>Edit profile</h2>
          </div>

          <form
            className="accountForm"
            onSubmit={submit}
          >

            <label className="formField">
              <span>Name</span>
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </label>

            <label className="formField">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </label>

            <label className="formField">
              <span>Role</span>
              <input
                value={user.role}
                disabled
              />
            </label>

            <div className="modalActions">

              <button
                type="button"
                className="saveButton"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="darkButton"
              >
                <Save size={14} />
                Save Changes
              </button>

            </div>

          </form>

        </section>

      ) : (

        <section className="infoBlock">

          <div className="infoBlockHeader">
            <h2>Ubah sandi</h2>
          </div>

          <form
            className="accountForm"
            onSubmit={submitPassword}
          >

            <label className="formField">
              <span>Sandi saat ini</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Masukkan sandi saat ini"
                required
              />
            </label>

            <label className="formField">
              <span>Sandi baru</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Minimal 6 karakter"
                minLength={6}
                required
              />
            </label>

            <label className="formField">
              <span>Konfirmasi sandi baru</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Ulangi sandi baru"
                minLength={6}
                required
              />
            </label>

            <div className="modalActions">

              <button
                type="button"
                className="saveButton"
                onClick={() => {
                  setChangingPassword(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="darkButton"
              >
                <Save size={14} />
                Simpan Sandi
              </button>

            </div>

          </form>

        </section>

      )}

    </div>
  );
}



/* =========================================================
   CREATE ACCOUNT MODAL
   ADMIN ONLY
========================================================= */

function CreateAccountModal({
  close,
  onSave,
  initialAccount,
  defaultRole = "User",
}) {

  const [name, setName] =
    useState(
      initialAccount?.name || ""
    );

  const [email, setEmail] =
    useState(
      initialAccount?.email || ""
    );

  const [role, setRole] =
    useState(
      initialAccount?.role === "Client"
        ? "Vendor"
        : initialAccount?.role || defaultRole
    );

  
  const [password, setPassword] =
    useState(
      initialAccount?.password || ""
    );

const submit = (e) => {

    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim()
    ) {
      alert(
        "Nama dan email wajib diisi."
      );
      return;
    }

    onSave({
      name,
      email,
      role,
    });
  };

  return (
    <div className="modalBg">

      <div className="modal">

        <button
          className="modalClose"
          onClick={close}
        >
          <X size={17} />
        </button>

        <small>ADMIN</small>

        <h2>
          {initialAccount
            ? "Edit account"
            : "Add account"}
        </h2>

        <p>
          Kelola akun technician dan vendor.
        </p>

        <form onSubmit={submit}>

          <label className="formField">
            <span>Name</span>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Full name"
            />
          </label>

          <label className="formField">
            <span>Email</span>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="email@example.com"
            />
          </label>

          <label className="formField">
            <span>Account type</span>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="User">
                Technician
              </option>

              <option value="Vendor">
                Vendor
              </option>

              <option value="Admin">
                Administrator
              </option>
            </select>
          </label>

          <div className="modalActions">

            <button
              type="button"
              className="saveButton"
              onClick={close}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="darkButton"
            >
              {initialAccount
                ? "Save Changes"
                : "Create Account"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   TEMPLATE MODAL
   ADMIN ONLY
========================================================= */

function TemplateModal({
  close,
  onSave,
  initialTemplate,
}) {

  const [id, setId] =
    useState(
      initialTemplate?.id || ""
    );

  const [name, setName] =
    useState(
      initialTemplate?.name || ""
    );

  const [category, setCategory] =
    useState(
      initialTemplate?.category ||
      "Maintenance"
    );

  const [fields, setFields] =
    useState(
      initialTemplate?.fields || 0
    );

  const submit = (e) => {

    e.preventDefault();

    if (!name.trim()) {
      alert(
        "Nama template wajib diisi."
      );
      return;
    }

    onSave({
      id:
        id.trim() ||
        undefined,
      name:
        name.trim(),
      category,
      fields:
        Number(fields) || 0,
    });
  };

  return (
    <div className="modalBg">

      <div className="modal">

        <button
          className="modalClose"
          onClick={close}
        >
          <X size={17} />
        </button>

        <small>ADMIN / TEMPLATES</small>

        <h2>
          {initialTemplate
            ? "Edit template"
            : "Add template"}
        </h2>

        <p>
          Kelola template report yang tersedia.
        </p>

        <form onSubmit={submit}>

          <label className="formField">
            <span>Template ID</span>

            <input
              value={id}
              disabled={
                Boolean(initialTemplate)
              }
              onChange={(e) =>
                setId(e.target.value)
              }
              placeholder="UPS-3P"
            />
          </label>

          <label className="formField">
            <span>Name</span>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Three Phase UPS"
            />
          </label>

          <label className="formField">
            <span>Category</span>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option>
                Maintenance
              </option>

              <option>
                Inspection
              </option>

              <option>
                Repair
              </option>

              <option>
                Installation
              </option>
            </select>
          </label>

          <label className="formField">
            <span>Number of fields</span>

            <input
              type="number"
              min="0"
              value={fields}
              onChange={(e) =>
                setFields(e.target.value)
              }
            />
          </label>

          <div className="modalActions">

            <button
              type="button"
              className="saveButton"
              onClick={close}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="darkButton"
            >
              {initialTemplate
                ? "Save Changes"
                : "Create Template"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* =========================================================
   CREATE REPORT PAGE
========================================================= */

function CreateReportPage({
  close,
  accounts,
  onCreate,
}) {
  const technicians = accounts.filter((account) => account.role === "User");

  const [reportKind, setReportKind] = useState("PM");
  const [form, setForm] = useState({ ...emptyForm });

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setNested = (group, key, value) =>
    setForm((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }));

  const setParam = (key, field, value) =>
    setForm((prev) => ({
      ...prev,
      pmParameters: {
        ...prev.pmParameters,
        [key]: { ...prev.pmParameters[key], [field]: value },
      },
    }));

  const setTimeline = (key, value) => setNested("timeline", key, value);
  const setEnv = (key, value) => setNested("environment", key, value);
  const setFinding = (key, value) => setNested("findings", key, value);
  const setDiagnosis = (key, value) => setNested("diagnosis", key, value);

  const submit = (e) => {
    e.preventDefault();
    if (!form.formId || !form.unitId || !form.locationRoom || !form.technicianName) {
      alert("Lengkapi ID Form, ID Unit, Lokasi/Ruang, dan Nama Teknisi.");
      return;
    }

    const technician = form.technicianName || technicians[0]?.name || "";
    const title = `${reportKind === "PM" ? "Preventive" : "Corrective"} Maintenance - ${form.unitId}`;
    const client = "Kantor Pusat DJP";
    const date = form.reportDate || new Date().toLocaleDateString("id-ID");

    onCreate({
      title,
      type: reportKind,
      client,
      technician,
      date,
      form: {
        ...form,
        reportKind,
        technicianName: technician,
      },
    });
  };

  const statusOptions = ["", "OK", "NO"];
  const parameterRows = [
    ["suctionPressure", "Suction Pressure (LP)", "psi"],
    ["dischargePressure", "Discharge Pressure (HP)", "psi"],
    ["leakCheck", "Leak Check", "-"],
    ["indoorFanCurrent", "Arus Fan Indoor / Blower", "A"],
    ["indoorFanFlow", "Flow Fan Indoor / Blower", "m/s"],
    ["outdoorFanCurrent", "Arus Fan Outdoor (jika ada)", "A"],
    ["outdoorFanFlow", "Flow Fan Outdoor (jika ada)", "m/s"],
    ["soundVibration", "Suara / Getaran", "-"],
    ["drainFlow", "Aliran drain lancar", "-"],
    ["noLeakOverflow", "Tidak ada bocor / overflow", "-"],
    ["setpointTemp", "Setpoint Temp", "°C"],
    ["setpointRh", "Setpoint RH", "%"],
    ["alarmLog", "Alarm aktif / Log alarm (PAC)", "-"],
    ["voltageLL", "Tegangan L-L R-S / S-T / T-R", "V"],
    ["voltageLN", "Tegangan L-N R-N / S-N / T-N", "V"],
    ["compressorCurrent", "Arus Kompresor R / S / T", "A"],
    ["fanCurrent", "Arus Fan", "A"],
    ["heaterCurrent", "Arus Heater", "A"],
    ["terminalConnection", "Terminal / koneksi", "-"],
    ["filterCleaned", "Filter dibersihkan", "Tanggal / PIC"],
    ["filterReplaced", "Filter diganti", "Tanggal / PIC"],
    ["coilEvaporator", "Coil evaporator dibersihkan", "-"],
    ["coilCondenser", "Coil kondensor dibersihkan", "-"],
    ["refrigerant", "Refrigeran", "-"],
    ["fanMotor", "Fan / Motor", "-"],
    ["drain", "Drain", "-"],
    ["controlAlarm", "Kontrol / Alarm", "-"],
    ["electrical", "Listrik", "-"],
  ];

  return (
    <div className="createReportPage">
      <div className="createReportHeader">
        <button type="button" className="backButton" onClick={close}>← Back</button>
        <small>WORKSPACE / NEW REPORT</small>
        <h1>{reportKind === "PM" ? "Form Preventive Maintenance" : "Form Corrective Maintenance"}</h1>
        <p>Form laporan cooling system mengikuti struktur kertas kerja pada assessment.</p>
      </div>

      <form className="createReportForm" onSubmit={submit}>
        <section className="createReportCard">
          <div className="createReportSectionHeader">
            <div>
              <small>FORM TYPE</small>
              <h2>Jenis laporan</h2>
            </div>
          </div>
          <div className="createReportGrid">
            <label className="createField">
              <span>Jenis Form</span>
              <select value={reportKind} onChange={(e) => { setReportKind(e.target.value); setField("reportKind", e.target.value); }}>
                <option value="PM">Preventive Maintenance (PM)</option>
                <option value="CM">Corrective Maintenance (CM)</option>
              </select>
            </label>
            <label className="createField">
              <span>ID Form</span>
              <input value={form.formId} onChange={(e) => setField("formId", e.target.value)} placeholder="Contoh: KPDJP-2026-09-PAC-2.13-CM" />
            </label>
          </div>
        </section>

        <section className="createReportCard">
          <div className="createReportSectionHeader"><div><small>IDENTITAS UNIT</small><h2>Identitas pekerjaan</h2></div></div>
          <div className="createReportGrid">
            <label className="createField"><span>ID Unit</span><input value={form.unitId} onChange={(e) => setField("unitId", e.target.value)} placeholder="PAC 2.13" /></label>
            <label className="createField"><span>Jenis</span><select value={form.unitType} onChange={(e) => setField("unitType", e.target.value)}><option>PAC</option><option>AC</option><option>Humidifier</option></select></label>
            <label className="createField"><span>Lokasi / Ruang</span><input value={form.locationRoom} onChange={(e) => setField("locationRoom", e.target.value)} placeholder="R. BIG DATA & AI" /></label>
            <label className="createField"><span>Nama Teknisi</span><select value={form.technicianName} onChange={(e) => setField("technicianName", e.target.value)}><option value="">Pilih teknisi</option>{technicians.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}</select></label>
            <label className="createField"><span>Tanggal</span><input type="date" value={form.reportDate} onChange={(e) => setField("reportDate", e.target.value)} /></label>
            <label className="createField"><span>Jam</span><input type="time" value={form.reportTime} onChange={(e) => setField("reportTime", e.target.value)} /></label>
            {reportKind === "CM" && <>
              <label className="createField"><span>Reported by</span><input value={form.reportedBy} onChange={(e) => setField("reportedBy", e.target.value)} /></label>
              <label className="createField"><span>Kontak</span><input value={form.contact} onChange={(e) => setField("contact", e.target.value)} /></label>
            </>}
          </div>
        </section>

        {reportKind === "PM" ? (
          <>
            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>A. SLA SUHU & RH</small><h2>Target vs Aktual</h2></div></div>
              <div className="reportMatrix">
                {[['roomTempTarget','roomTempActual','roomTempStatus','Suhu Ruang / Return (°C)'],['supplyTempTarget','supplyTempActual','supplyTempStatus','Suhu Supply (°C)'],['deltaTTarget','deltaTActual','deltaTStatus','ΔT Return–Supply (°C)'],['rhTarget','rhActual','rhStatus','RH (%)']].map(([t,a,s,label]) => <div className="reportMatrixRow" key={label}><strong>{label}</strong><input placeholder="Target" value={form.environment[t]} onChange={(e)=>setEnv(t,e.target.value)}/><input placeholder="Aktual" value={form.environment[a]} onChange={(e)=>setEnv(a,e.target.value)}/><select value={form.environment[s]} onChange={(e)=>setEnv(s,e.target.value)}><option value="">Status</option><option>OK</option><option>NO</option></select></div>)}
              </div>
            </section>

            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>B. PARAMETER PM BULANAN</small><h2>Parameter pemeriksaan</h2></div></div>
              <div className="reportMatrix">
                {parameterRows.map(([key,label,unit]) => {
                  const item=form.pmParameters[key]||{};
                  return <div className="reportMatrixRow" key={key}><strong>{label}</strong><span className="reportUnit">{unit}</span><input placeholder="Nilai / keterangan" value={item.value||""} onChange={(e)=>setParam(key,"value",e.target.value)}/><select value={item.status||""} onChange={(e)=>setParam(key,"status",e.target.value)}>{statusOptions.map((x)=><option key={x} value={x}>{x || "Status"}</option>)}</select><input placeholder="Catatan" value={item.notes||""} onChange={(e)=>setParam(key,"notes",e.target.value)}/></div>
                })}
              </div>
            </section>

            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>C. KEGIATAN 2-BULANAN</small><h2>Jadwal pekerjaan</h2></div></div>
              <div className="createReportGrid">
                <label className="createField"><span>Evidence ID</span><input value={form.evidenceId} onChange={(e)=>setField("evidenceId",e.target.value)}/></label>
                <label className="createField"><span>Filter dibersihkan / diganti</span><input value={form.pmParameters.filterCleaned.date || ""} onChange={(e)=>setParam("filterCleaned","date",e.target.value)} placeholder="Tanggal"/></label>
                <label className="createField"><span>PIC</span><input value={form.pmParameters.filterCleaned.pic || ""} onChange={(e)=>setParam("filterCleaned","pic",e.target.value)}/></label>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>B. TIMELINE & SLA PENANGANAN</small><h2>Timeline</h2></div></div>
              <div className="createReportGrid">
                {[["laporMasuk","Lapor masuk"],["response","Response / Datang ke lokasi"],["mulaiPerbaikan","Mulai perbaikan"],["selesaiPerbaikan","Selesai perbaikan"],["verifikasi","Verifikasi / Monitoring"]].map(([k,l])=><label className="createField" key={k}><span>{l}</span><input type="datetime-local" value={form.timeline[k]} onChange={(e)=>setTimeline(k,e.target.value)}/></label>)}
                <label className="createField"><span>Jenis CM</span><select value={form.slaType} onChange={(e)=>{setField("slaType",e.target.value);setField("slaTarget",e.target.value.includes("Dengan")?"≤ 2×24 jam":"≤ 1×24 jam")}}><option>Tanpa penggantian spare part</option><option>Dengan penggantian spare part</option></select></label>
                <label className="createField"><span>Target SLA</span><input value={form.slaTarget} readOnly /></label>
                <label className="createField"><span>Realisasi (Durasi)</span><input value={form.slaRealization} onChange={(e)=>setField("slaRealization",e.target.value)} /></label>
                <label className="createField"><span>Status SLA</span><select value={form.slaStatus} onChange={(e)=>setField("slaStatus",e.target.value)}><option value="">Pilih</option><option>OK</option><option>NO</option></select></label>
              </div>
            </section>

            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>C. DIAGNOSA & ROOT CAUSE</small><h2>Diagnosa</h2></div></div>
              <div className="createReportGrid">
                <label className="createField"><span>Alarm / Code</span><input value={form.diagnosis.alarmCode} onChange={(e)=>setDiagnosis("alarmCode",e.target.value)} /></label>
                <label className="createField"><span>Gejala / Keluhan</span><input value={form.diagnosis.symptom} onChange={(e)=>setDiagnosis("symptom",e.target.value)} /></label>
                <label className="createField"><span>Risiko / Impact</span><input value={form.diagnosis.riskImpact} onChange={(e)=>setDiagnosis("riskImpact",e.target.value)} /></label>
              </div>
            </section>

            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>D. TINDAKAN PERBAIKAN</small><h2>Work Done</h2></div></div>
              <div className="createReportGrid"><label className="createField full"><span>Detail tindakan</span><textarea value={form.diagnosis.workDone} onChange={(e)=>setDiagnosis("workDone",e.target.value)} /></label></div>
            </section>

            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>E. SPARE PART / MATERIAL</small><h2>Material</h2></div></div>
              <div className="createReportGrid"><label className="createField"><span>Nama Spare Part / Material</span><input value={form.sparePart} onChange={(e)=>setField("sparePart",e.target.value)} /></label></div>
            </section>

            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>F. HASIL VERIFIKASI</small><h2>Setelah perbaikan</h2></div></div>
              <div className="createReportGrid"><label className="createField"><span>Room / Area</span><input value={form.diagnosis.returnRoom} onChange={(e)=>setDiagnosis("returnRoom",e.target.value)} /></label><label className="createField"><span>Durasi pantau</span><input value={form.diagnosis.monitoringDuration} onChange={(e)=>setDiagnosis("monitoringDuration",e.target.value)} /></label><label className="createField full"><span>Catatan</span><textarea value={form.diagnosis.verificationNote} onChange={(e)=>setDiagnosis("verificationNote",e.target.value)} /></label></div>
            </section>

            <section className="createReportCard">
              <div className="createReportSectionHeader"><div><small>G. EVIDENCE</small><h2>Foto / Log Before & After</h2></div></div>
              <div className="createReportGrid"><label className="createField"><span>Evidence ID</span><input value={form.evidenceId} onChange={(e)=>setField("evidenceId",e.target.value)} /></label><label className="createField"><span>Evidence Before</span><input value={form.evidenceBefore} onChange={(e)=>setField("evidenceBefore",e.target.value)} /></label><label className="createField"><span>Evidence After</span><input value={form.evidenceAfter} onChange={(e)=>setField("evidenceAfter",e.target.value)} /></label></div>
            </section>
          </>
        )}

        <section className="createReportCard">
          <div className="createReportSectionHeader"><div><small>RINGKASAN TEMUAN</small><h2>Temuan & tindak lanjut</h2></div></div>
          <div className="createReportGrid">
            <label className="createField full"><span>Temuan Utama</span><textarea value={form.findings.mainFinding} onChange={(e)=>setFinding("mainFinding",e.target.value)} /></label>
            <label className="createField"><span>Tindak Lanjut</span><input value={form.findings.followUp} onChange={(e)=>setFinding("followUp",e.target.value)} /></label>
            <label className="createField"><span>Target Selesai</span><input type="date" value={form.findings.targetCompletion} onChange={(e)=>setFinding("targetCompletion",e.target.value)} /></label>
            <label className="createField"><span>PIC</span><input value={form.findings.pic} onChange={(e)=>setFinding("pic",e.target.value)} /></label>
            <label className="createField"><span>Diperlukan CM</span><select value={form.findings.requiredCM} onChange={(e)=>setFinding("requiredCM",e.target.value)}><option value="">Pilih</option><option>Ya</option><option>Tidak</option></select></label>
            <label className="createField"><span>No. WO / CM</span><input value={form.findings.workOrderCM} onChange={(e)=>setFinding("workOrderCM",e.target.value)} /></label>
          </div>
        </section>

        <div className="createReportFooter">
          <button type="button" className="createCancelButton" onClick={close}>Cancel</button>
          <button type="submit" className="createSubmitButton"><Plus size={15}/> Create Report</button>
        </div>
      </form>
    </div>
  );
}


/* =========================================================
   ROOT
========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <App />
);