import jsPDF from "jspdf";
import QRCode from "qrcode";

/**
 * PDF report renderer.
 *
 * The web form is the source of truth. The PDF intentionally follows the
 * structure of the PM / CM paper forms while keeping the application's own
 * company and report data.
 */
export async function generateReportPDF(report = {}) {
  const pdf = new jsPDF("p", "mm", "a4");

  const W = 210;
  const H = 297;
  const M = 12;
  const CW = W - M * 2;

  const form = report.form || {};
  const kind = form.reportKind || report.type || "PM";
  const isPM = kind === "PM";

  const companyName =
    report.companyName ||
    report.company ||
    "Berkasa";

  const customerName =
    report.client ||
    report.vendor ||
    "-";

  const technician =
    form.technicianName ||
    report.technician ||
    "-";

  const reportDate =
    form.reportDate ||
    report.date ||
    "-";

  const reportTime =
    form.reportTime ||
    "-";

  const clean = (v) => {
    if (
      v === undefined ||
      v === null ||
      v === ""
    ) {
      return "-";
    }

    return String(v);
  };

  const has = (v) =>
    !(
      v === undefined ||
      v === null ||
      v === ""
    );

  const safeLines = (v, width) =>
    pdf.splitTextToSize(
      clean(v),
      width
    );

  const font = (
    size = 7,
    style = "normal"
  ) => {
    pdf.setFont(
      "helvetica",
      style
    );

    pdf.setFontSize(size);

    pdf.setTextColor(
      35,
      45,
      58
    );
  };

  const line = (
    y,
    x1 = M,
    x2 = W - M,
    weight = 0.25
  ) => {
    pdf.setDrawColor(
      125,
      135,
      145
    );

    pdf.setLineWidth(weight);

    pdf.line(
      x1,
      y,
      x2,
      y
    );
  };

  const rect = (
    x,
    y,
    w,
    h,
    fill = false
  ) => {
    pdf.setDrawColor(
      130,
      140,
      150
    );

    pdf.setLineWidth(0.25);

    pdf.rect(
      x,
      y,
      w,
      h,
      fill ? "F" : "S"
    );
  };

  const section = (
    title,
    y
  ) => {
    pdf.setFillColor(
      231,
      237,
      244
    );

    pdf.setDrawColor(
      125,
      135,
      145
    );

    pdf.setLineWidth(0.25);

    pdf.rect(
      M,
      y,
      CW,
      7,
      "FD"
    );

    font(
      7.5,
      "bold"
    );

    pdf.text(
      title,
      M + 3,
      y + 4.7
    );

    return y + 7;
  };

  const table = (
    columns,
    rows,
    x,
    y,
    widths,
    options = {}
  ) => {
    const headerH =
      options.headerH || 7;

    const rowH =
      options.rowH || 7;

    const fontSize =
      options.fontSize || 6.1;

    const totalW =
      widths.reduce(
        (a, b) => a + b,
        0
      );

    let cy = y;

    pdf.setFillColor(
      232,
      237,
      242
    );

    pdf.setDrawColor(
      125,
      135,
      145
    );

    pdf.setLineWidth(0.25);

    pdf.rect(
      x,
      cy,
      totalW,
      headerH,
      "FD"
    );

    let cx = x;

    columns.forEach(
      (col, i) => {
        if (i > 0) {
          pdf.line(
            cx,
            cy,
            cx,
            cy + headerH
          );
        }

        font(
          fontSize,
          "bold"
        );

        const lines =
          pdf.splitTextToSize(
            col,
            widths[i] - 2.2
          );

        pdf.text(
          lines,
          cx + 1.1,
          cy + 3.2
        );

        cx += widths[i];
      }
    );

    cy += headerH;

    rows.forEach(
      (row) => {
        const prepared =
          row.map(
            (cell, i) =>
              pdf.splitTextToSize(
                clean(cell),
                widths[i] - 2.2
              )
          );

        const maxLines =
          Math.max(
            ...prepared.map(
              (v) => v.length
            ),
            1
          );

        const h =
          Math.max(
            rowH,
            maxLines * 3.1 + 2.8
          );

        pdf.rect(
          x,
          cy,
          totalW,
          h,
          "S"
        );

        cx = x;

        row.forEach(
          (_, i) => {
            if (i > 0) {
              pdf.line(
                cx,
                cy,
                cx,
                cy + h
              );
            }

            font(
              fontSize,
              i === 0 &&
              options.firstColBold
                ? "bold"
                : "normal"
            );

            pdf.text(
              prepared[i],
              cx + 1.1,
              cy + 4
            );

            cx += widths[i];
          }
        );

        cy += h;
      }
    );

    return cy;
  };

  const fieldTable = (
    pairs,
    y,
    cols = 2
  ) => {
    const gap = 3;

    const cellW =
      (CW -
        gap * (cols - 1)) /
      cols;

    const cellH = 10;

    for (
      let i = 0;
      i < pairs.length;
      i += cols
    ) {
      const row =
        pairs.slice(
          i,
          i + cols
        );

      const yy =
        y +
        Math.floor(
          i / cols
        ) *
          cellH;

      row.forEach(
        ([label, value], j) => {
          const x =
            M +
            j *
              (cellW + gap);

          rect(
            x,
            yy,
            cellW,
            cellH
          );

          font(
            5.8,
            "normal"
          );

          pdf.text(
            label,
            x + 2,
            yy + 3.6
          );

          font(
            6.5,
            "bold"
          );

          pdf.text(
            safeLines(
              value,
              cellW - 4
            ).slice(0, 2),
            x + 2,
            yy + 7.2
          );
        }
      );
    }

    return (
      y +
      Math.ceil(
        pairs.length / cols
      ) *
        cellH
    );
  };

  const statusText = (
    status
  ) => clean(status);

  const header = (
    pageLabel
  ) => {
    font(
      8.5,
      "bold"
    );

    pdf.text(
      companyName,
      M,
      12
    );

    font(
      5.8,
      "normal"
    );

    pdf.text(
      "E-Reporting | Maintenance Report",
      M,
      16
    );

    font(
      5.8,
      "normal"
    );

    pdf.text(
      pageLabel,
      W - M,
      12,
      {
        align: "right"
      }
    );

    pdf.text(
      clean(report.id),
      W - M,
      16,
      {
        align: "right"
      }
    );

    line(20);
  };

  const footer = (
    pageNo,
    totalPages
  ) => {
    line(284);

    font(
      5.5,
      "normal"
    );

    pdf.text(
      "Dokumen kerja internal",
      M,
      289
    );

    pdf.text(
      "Rahasia",
      W / 2,
      289,
      {
        align: "center"
      }
    );

    pdf.text(
      `${pageNo} / ${totalPages}`,
      W - M,
      289,
      {
        align: "right"
      }
    );
  };

  /* ============================================================
     PAGE 1
  ============================================================ */

  header(
    isPM
      ? "Preventive Maintenance (PM)"
      : "Corrective Maintenance (CM)"
  );

  font(
    12,
    "bold"
  );

  pdf.text(
    isPM
      ? "Form Preventive Maintenance"
      : "Form Corrective Maintenance",
    M,
    30
  );

  font(
    6.2,
    "normal"
  );

  pdf.text(
    "Pemeliharaan cooling system",
    M,
    35
  );

  let y = 40;

  y = fieldTable(
    [
      ["ID Form", form.formId],
      ["ID Unit", form.unitId],
      ["Jenis", form.unitType],
      ["Lokasi / Ruang", form.locationRoom],
      ["Tanggal", reportDate],
      ["Jam", reportTime],
      ["Nama Teknisi", technician],
      ["Vendor / Customer", customerName],
    ],
    y,
    2
  );

  if (!isPM) {
    y += 3;

    y = fieldTable(
      [
        ["Reported by", form.reportedBy],
        ["Kontak", form.contact],
        ["Jenis CM", form.slaType],
        ["Target SLA", form.slaTarget],
      ],
      y,
      2
    );
  }

  y += 4;

  y = section(
    "A. Identitas unit",
    y
  );

  y = table(
    ["Field", "Data"],
    [
      [
        "Unit",
        form.unitId
      ],
      [
        "Jenis",
        form.unitType
      ],
      [
        "Lokasi / Ruang",
        form.locationRoom
      ],
      [
        "Teknisi",
        technician
      ],
    ],
    M,
    y,
    [
      48,
      CW - 48
    ],
    {
      rowH: 7,
      fontSize: 6.2,
      firstColBold: true
    }
  );

  y += 4;

  y = section(
    "B. Detail pekerjaan",
    y
  );

  y = table(
    ["Field", "Data"],
    [
      [
        "Status laporan",
        statusText(
          report.status
        )
      ],
      [
        "Tanggal",
        reportDate
      ],
      [
        "Jam",
        reportTime
      ],
      [
        "ID Form",
        form.formId
      ],
      ...(isPM
        ? []
        : [
            [
              "Jenis CM",
              form.slaType
            ],
            [
              "Target SLA",
              form.slaTarget
            ],
            [
              "Realisasi",
              form.slaRealization
            ],
            [
              "Status SLA",
              form.slaStatus
            ],
          ]),
    ],
    M,
    y,
    [
      48,
      CW - 48
    ],
    {
      rowH: 7,
      fontSize: 6.2,
      firstColBold: true
    }
  );

  y += 4;

  y = section(
    "C. Produk / perangkat",
    y
  );

  y = table(
    [
      "Field",
      "Data",
      "Field",
      "Data"
    ],
    [
      [
        "Produk",
        form.product,
        "Model",
        form.model
      ],
      [
        "Type / Form",
        form.typeForm,
        "Serial Number",
        form.serialNumber
      ],
      [
        "Battery Type",
        form.batteryType,
        "Battery Quantity",
        form.batteryQuantity
      ],
    ],
    M,
    y,
    [
      31,
      62,
      31,
      70
    ],
    {
      rowH: 7,
      fontSize: 6.0,
      firstColBold: true
    }
  );

  footer(
    1,
    3
  );

  pdf.addPage();

  /* ============================================================
     PAGE 2
  ============================================================ */

  header(
    isPM
      ? "Preventive Maintenance (PM)"
      : "Corrective Maintenance (CM)"
  );

  y = 25;

  if (isPM) {
    y = section(
      "A. SLA suhu & RH - target vs aktual",
      y
    );

    y = table(
      [
        "Parameter",
        "Target",
        "Aktual",
        "Status"
      ],
      [
        [
          "Suhu Ruang / Return (C)",
          form.environment
            ?.roomTempTarget,
          form.environment
            ?.roomTempActual,
          form.environment
            ?.roomTempStatus
        ],
        [
          "Suhu Supply (C)",
          form.environment
            ?.supplyTempTarget,
          form.environment
            ?.supplyTempActual,
          form.environment
            ?.supplyTempStatus
        ],
        [
          "Delta T Return - Supply (C)",
          form.environment
            ?.deltaTTarget,
          form.environment
            ?.deltaTActual,
          form.environment
            ?.deltaTStatus
        ],
        [
          "RH (%)",
          form.environment
            ?.rhTarget,
          form.environment
            ?.rhActual,
          form.environment
            ?.rhStatus
        ],
      ],
      M,
      y,
      [
        78,
        38,
        38,
        CW - 154
      ],
      {
        rowH: 7,
        fontSize: 6.0,
        firstColBold: true
      }
    );

    y += 4;

    y = section(
      "B. Parameter PM bulanan",
      y
    );

    const params = [
      [
        "Suction Pressure (LP)",
        "suctionPressure",
        "psi"
      ],
      [
        "Discharge Pressure (HP)",
        "dischargePressure",
        "psi"
      ],
      [
        "Leak Check",
        "leakCheck",
        "-"
      ],
      [
        "Arus Fan Indoor / Blower",
        "indoorFanCurrent",
        "A"
      ],
      [
        "Flow Fan Indoor / Blower",
        "indoorFanFlow",
        "m/s"
      ],
      [
        "Arus Fan Outdoor",
        "outdoorFanCurrent",
        "A"
      ],
      [
        "Flow Fan Outdoor",
        "outdoorFanFlow",
        "m/s"
      ],
      [
        "Suara / Getaran",
        "soundVibration",
        "-"
      ],
      [
        "Aliran drain lancar",
        "drainFlow",
        "-"
      ],
      [
        "Tidak ada bocor / overflow",
        "noLeakOverflow",
        "-"
      ],
      [
        "Setpoint Temp",
        "setpointTemp",
        "C"
      ],
      [
        "Setpoint RH",
        "setpointRh",
        "%"
      ],
      [
        "Alarm aktif / Log alarm",
        "alarmLog",
        "-"
      ],
      [
        "Tegangan L-L",
        "voltageLL",
        "V"
      ],
      [
        "Tegangan L-N",
        "voltageLN",
        "V"
      ],
      [
        "Arus Kompresor R / S / T",
        "compressorCurrent",
        "A"
      ],
      [
        "Arus Fan",
        "fanCurrent",
        "A"
      ],
      [
        "Arus Heater",
        "heaterCurrent",
        "A"
      ],
      [
        "Terminal / koneksi",
        "terminalConnection",
        "-"
      ],
      [
        "Filter dibersihkan",
        "filterCleaned",
        "Tanggal / PIC"
      ],
      [
        "Filter diganti",
        "filterReplaced",
        "Tanggal / PIC"
      ],
      [
        "Coil evaporator dibersihkan",
        "coilEvaporator",
        "-"
      ],
      [
        "Coil kondensor dibersihkan",
        "coilCondenser",
        "-"
      ],
      [
        "Refrigeran",
        "refrigerant",
        "-"
      ],
      [
        "Fan / Motor",
        "fanMotor",
        "-"
      ],
      [
        "Drain",
        "drain",
        "-"
      ],
      [
        "Kontrol / Alarm",
        "controlAlarm",
        "-"
      ],
      [
        "Listrik",
        "electrical",
        "-"
      ],
    ];

    const rows =
      params.map(
        ([
          label,
          key,
          unit
        ]) => {
          const item =
            form.pmParameters
              ?.[
                key
              ] || {};

          let val =
            item.value;

          if (
            key ===
              "filterCleaned" ||
            key ===
              "filterReplaced"
          ) {
            val = [
              item.value,
              item.date,
              item.pic
            ]
              .filter(has)
              .join(" | ");
          }

          return [
            label,
            unit,
            val,
            item.status,
            item.notes
          ];
        }
      );

    y = table(
      [
        "Parameter",
        "Unit",
        "Nilai",
        "Status",
        "Catatan"
      ],
      rows,
      M,
      y,
      [
        72,
        18,
        38,
        24,
        CW - 152
      ],
      {
        rowH: 5.8,
        fontSize: 5.5,
        firstColBold: false
      }
    );
  } else {
    y = section(
      "A. Identitas kejadian / tiket",
      y
    );

    y = table(
      [
        "Field",
        "Data",
        "Field",
        "Data"
      ],
      [
        [
          "ID Form",
          form.formId,
          "ID Unit",
          form.unitId
        ],
        [
          "Tanggal lapor",
          form.reportDate,
          "Jam lapor",
          form.reportTime
        ],
        [
          "Dilaporkan oleh",
          form.reportedBy,
          "Kontak",
          form.contact
        ],
        [
          "Lokasi / Ruang",
          form.locationRoom,
          "Nama Teknisi",
          technician
        ],
      ],
      M,
      y,
      [
        31,
        64,
        31,
        68
      ],
      {
        rowH: 7,
        fontSize: 6.0,
        firstColBold: true
      }
    );

    y += 4;

    y = section(
      "B. Timeline & SLA penanganan",
      y
    );

    y = table(
      [
        "Tahap",
        "Waktu"
      ],
      [
        [
          "Lapor masuk",
          form.timeline
            ?.laporMasuk
        ],
        [
          "Response / datang ke lokasi",
          form.timeline
            ?.response
        ],
        [
          "Mulai perbaikan",
          form.timeline
            ?.mulaiPerbaikan
        ],
        [
          "Selesai perbaikan",
          form.timeline
            ?.selesaiPerbaikan
        ],
        [
          "Verifikasi / monitoring",
          form.timeline
            ?.verifikasi
        ],
      ],
      M,
      y,
      [
        78,
        CW - 78
      ],
      {
        rowH: 7,
        fontSize: 6.0,
        firstColBold: true
      }
    );

    y += 4;

    y = table(
      [
        "Jenis CM",
        "Target SLA",
        "Realisasi",
        "Status SLA"
      ],
      [
        [
          form.slaType,
          form.slaTarget,
          form.slaRealization,
          form.slaStatus
        ],
      ],
      M,
      y,
      [
        65,
        45,
        45,
        CW - 155
      ],
      {
        rowH: 8,
        fontSize: 6.0
      }
    );

    y += 4;

    y = section(
      "C. Diagnosa & root cause",
      y
    );

    y = table(
      [
        "Field",
        "Data"
      ],
      [
        [
          "Alarm / Code",
          form.diagnosis
            ?.alarmCode
        ],
        [
          "Gejala / Keluhan",
          form.diagnosis
            ?.symptom
        ],
        [
          "Risiko / Impact",
          form.diagnosis
            ?.riskImpact
        ],
      ],
      M,
      y,
      [
        48,
        CW - 48
      ],
      {
        rowH: 8,
        fontSize: 6.0,
        firstColBold: true
      }
    );

    y += 4;

    y = section(
      "D. Tindakan perbaikan",
      y
    );

    y = table(
      [
        "Detail tindakan"
      ],
      [
        [
          form.diagnosis
            ?.workDone
        ],
      ],
      M,
      y,
      [CW],
      {
        rowH: 18,
        fontSize: 6.0
      }
    );

    y += 4;

    y = section(
      "E. Spare part / material",
      y
    );

    y = table(
      [
        "Nama Spare Part / Material"
      ],
      [
        [
          form.sparePart
        ],
      ],
      M,
      y,
      [CW],
      {
        rowH: 10,
        fontSize: 6.0
      }
    );
  }

  footer(
    2,
    3
  );

  pdf.addPage();

  /* ============================================================
     PAGE 3
  ============================================================ */

  header(
    isPM
      ? "Preventive Maintenance (PM)"
      : "Corrective Maintenance (CM)"
  );

  y = 25;

  if (!isPM) {
    y = section(
      "F. Hasil verifikasi setelah perbaikan",
      y
    );

    y = table(
      [
        "Parameter",
        "Data"
      ],
      [
        [
          "Room / Area",
          form.diagnosis
            ?.returnRoom
        ],
        [
          "Durasi pantau",
          form.diagnosis
            ?.monitoringDuration
        ],
        [
          "Catatan",
          form.diagnosis
            ?.verificationNote
        ],
      ],
      M,
      y,
      [
        48,
        CW - 48
      ],
      {
        rowH: 8,
        fontSize: 6.0,
        firstColBold: true
      }
    );

    y += 4;

    y = section(
      "G. Evidence (foto / log) - before / after",
      y
    );

    y = table(
      [
        "Evidence ID",
        "Before",
        "After"
      ],
      [
        [
          form.evidenceId,
          form.evidenceBefore,
          form.evidenceAfter
        ],
      ],
      M,
      y,
      [
        50,
        70,
        CW - 120
      ],
      {
        rowH: 12,
        fontSize: 6.0
      }
    );
  } else {
    y = section(
      "C. Kegiatan 2-bulanan",
      y
    );

    y = table(
      [
        "Field",
        "Data"
      ],
      [
        [
          "Evidence ID",
          form.evidenceId
        ],
        [
          "Filter dibersihkan / diganti",
          form.pmParameters
            ?.filterCleaned
            ?.date
        ],
        [
          "PIC",
          form.pmParameters
            ?.filterCleaned
            ?.pic
        ],
        [
          "Filter diganti - tanggal",
          form.pmParameters
            ?.filterReplaced
            ?.date
        ],
        [
          "Filter diganti - PIC",
          form.pmParameters
            ?.filterReplaced
            ?.pic
        ],
      ],
      M,
      y,
      [
        65,
        CW - 65
      ],
      {
        rowH: 7,
        fontSize: 6.0,
        firstColBold: true
      }
    );
  }

  y += 4;

  y = section(
    "Temuan & tindak lanjut",
    y
  );

  y = table(
    [
      "Field",
      "Data"
    ],
    [
      [
        "Temuan Utama",
        form.findings
          ?.mainFinding
      ],
      [
        "Tindak Lanjut",
        form.findings
          ?.followUp
      ],
      [
        "Target Selesai",
        form.findings
          ?.targetCompletion
      ],
      [
        "PIC",
        form.findings
          ?.pic
      ],
      [
        "Diperlukan CM",
        form.findings
          ?.requiredCM
      ],
      [
        "No. WO / CM",
        form.findings
          ?.workOrderCM
      ],
    ],
    M,
    y,
    [
      48,
      CW - 48
    ],
    {
      rowH: 8,
      fontSize: 6.0,
      firstColBold: true
    }
  );

  y += 4;

  y = section(
    "Catatan",
    y
  );

  y = table(
    [
      "Catatan pekerjaan"
    ],
    [
      [
        form.notes
      ],
    ],
    M,
    y,
    [CW],
    {
      rowH: 18,
      fontSize: 6.0
    }
  );

  if (
    form.attachmentPhoto
  ) {
    y += 4;

    y = section(
      "Lampiran foto",
      y
    );

    try {
      const imageY =
        y + 2;

      pdf.addImage(
        form.attachmentPhoto,
        "JPEG",
        M,
        imageY,
        55,
        38
      );

      rect(
        M,
        imageY,
        55,
        38
      );

      y =
        imageY + 40;
    } catch (
      error
    ) {
      console.warn(
        "Attachment image could not be added:",
        error
      );
    }
  }

  /* ============================================================
     SIGNATURE AREA
     Tidak ada lagi tulisan besar
     "Technician SCAN TO SIGN"
     "Vendor SCAN TO SIGN"
  ============================================================ */

  y = Math.min(
    Math.max(
      y + 6,
      215
    ),
    238
  );

  y = section(
    "Paraf / tanda tangan",
    y
  );

  const sigTop =
    y + 5;

  const sigGap = 6;

  const sigW =
    (CW - sigGap) / 2;

  const sigH = 38;

  const leftSigX = M;

  const rightSigX =
    M +
    sigW +
    sigGap;

  /*
   * Kotak tanda tangan teknisi
   */
  rect(
    leftSigX,
    sigTop,
    sigW,
    sigH
  );

  /*
   * Kotak tanda tangan vendor
   */
  rect(
    rightSigX,
    sigTop,
    sigW,
    sigH
  );

  /*
   * Technician signature
   */
  if (
    report.technicianSignature
  ) {
    try {
      pdf.addImage(
        report.technicianSignature,
        "PNG",
        leftSigX + 6,
        sigTop + 8,
        58,
        22
      );
    } catch (
      error
    ) {
      console.warn(
        "Technician signature could not be added:",
        error
      );
    }
  }

  /*
   * Vendor signature
   */
  const clientSignature =
    report.vendorSignature ||
    report.clientSignature ||
    "";

  if (
    clientSignature
  ) {
    try {
      pdf.addImage(
        clientSignature,
        "PNG",
        rightSigX + 6,
        sigTop + 8,
        58,
        22
      );
    } catch (
      error
    ) {
      console.warn(
        "Vendor signature could not be added:",
        error
      );
    }
  } else {
    /*
     * Kalau vendor belum tanda tangan,
     * tampilkan QR saja.
     */

    const browserOrigin =
      typeof window !==
      "undefined"
        ? window.location.origin
        : "";

    const baseUrl =
      report.publicAppUrl ||
      browserOrigin ||
      "";

    if (
      baseUrl &&
      report.id
    ) {
      try {
        const signUrl =
          `${String(
            baseUrl
          ).replace(
            /\/+$/,
            ""
          )}/sign/vendor/${encodeURIComponent(
            report.id
          )}`;

        const qrData =
          await QRCode.toDataURL(
            signUrl,
            {
              margin: 1,
              width: 220,
              errorCorrectionLevel:
                "M",
            }
          );

        pdf.addImage(
          qrData,
          "PNG",
          rightSigX +
            sigW -
            32,
          sigTop + 6,
          25,
          25
        );
      } catch (
        error
      ) {
        console.warn(
          "QR generation error:",
          error
        );
      }
    }
  }

  /*
   * Nama teknisi dan vendor.
   */
  font(
    6.2,
    "bold"
  );

  pdf.text(
    technician,
    leftSigX + 3,
    sigTop +
      sigH -
      4
  );

  pdf.text(
    customerName,
    rightSigX + 3,
    sigTop +
      sigH -
      4
  );

  footer(
    3,
    3
  );

  /* ============================================================
     OUTPUT
  ============================================================ */

  if (
    report.openInNewTab &&
    typeof window !==
      "undefined"
  ) {
    return pdf.output(
      "bloburl"
    );
  }

  const fileName =
    `${
      report.id ||
      "report"
    }.pdf`;

  const blob =
    pdf.output("blob");

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    fileName;

  link.style.display =
    "none";

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );
}