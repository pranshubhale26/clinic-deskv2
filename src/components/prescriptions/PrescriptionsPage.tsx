import React, { useEffect, useState } from 'react';
import { FileText, Search, Printer, X, Send } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { Consultation } from '../../types/database';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { PrintPrescriptionView } from '../EMR/PrintPrescriptionView';

export const PrescriptionsPage: React.FC = () => {
  const { doctor } = useAuth();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedConsultationForPrint, setSelectedConsultationForPrint] =
    useState<Consultation | null>(null);

  const [whatsappConsultation, setWhatsappConsultation] =
    useState<Consultation | null>(null);

  const [generatingPdf, setGeneratingPdf] = useState(false);

  // ---------------------------------------------------------
  // LOAD PRESCRIPTIONS
  // ---------------------------------------------------------

  const loadPrescriptions = async () => {
    setLoading(true);

    try {
      const data = await dataService.getConsultations();

      setConsultations(
        data.filter(
          (c) => c.prescriptions && c.prescriptions.length > 0
        )
      );
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // OPEN WHATSAPP MODAL
  // ---------------------------------------------------------

  const handleSendWhatsApp = (consultation: Consultation) => {
    const patient = consultation.patient;

    if (!patient) {
      alert('Patient information not found.');
      return;
    }

    if (!patient.phone) {
      alert('Patient does not have a WhatsApp number.');
      return;
    }

    setWhatsappConsultation(consultation);
  };

  // ---------------------------------------------------------
  // GENERATE PDF
  // ---------------------------------------------------------

  const handleConfirmWhatsApp = async () => {
    if (!whatsappConsultation || !doctor) {
      return;
    }

    setGeneratingPdf(true);

    try {
      console.log('Starting prescription PDF generation...');

      const printElement = document.querySelector(
        '#whatsapp-prescription-preview .print-page'
      ) as HTMLElement | null;

      if (!printElement) {
        throw new Error(
          'Prescription preview could not be found.'
        );
      }

      console.log('Prescription preview found.');

      // -------------------------------------------------------
      // WAIT FOR IMAGES
      // -------------------------------------------------------

      const images = Array.from(
        printElement.querySelectorAll('img')
      );

      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }

              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      console.log('Images loaded.');

      // -------------------------------------------------------
      // CREATE A CLEAN CLONE
      // -------------------------------------------------------

      const clone = printElement.cloneNode(true) as HTMLElement;

      // Put clone somewhere visible to html2canvas
      // but outside the normal application UI.
      clone.style.position = 'fixed';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.maxWidth = '800px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.zIndex = '-9999';
      clone.style.opacity = '1';
      clone.style.pointerEvents = 'none';

      document.body.appendChild(clone);

      // -------------------------------------------------------
      // REMOVE TAILWIND CLASSES THAT CAUSE OKLCH PROBLEMS
      // -------------------------------------------------------

      const allElements = [
        clone,
        ...Array.from(
          clone.querySelectorAll<HTMLElement>('*')
        ),
      ];

      allElements.forEach((element) => {
        // Get the computed styles from the original element
        const originalElements = [
          printElement,
          ...Array.from(
            printElement.querySelectorAll<HTMLElement>('*')
          ),
        ];

        const index = allElements.indexOf(element);
        const originalElement = originalElements[index];

        if (!originalElement) {
          return;
        }

        const computed = window.getComputedStyle(
          originalElement
        );

        // -----------------------------------------------------
        // Helper to convert unsupported colors
        // -----------------------------------------------------

        const safeColor = (
          value: string,
          fallback: string
        ) => {
          if (!value) return fallback;

          // html2canvas has problems with oklch()
          if (
            value.includes('oklch') ||
            value.includes('oklab') ||
            value.includes('color(')
          ) {
            return fallback;
          }

          return value;
        };

        // -----------------------------------------------------
        // Copy important visual styles as safe inline styles
        // -----------------------------------------------------

        element.style.color = safeColor(
          computed.color,
          '#0f172a'
        );

        element.style.backgroundColor = safeColor(
          computed.backgroundColor,
          'transparent'
        );

        element.style.borderTopColor = safeColor(
          computed.borderTopColor,
          '#e2e8f0'
        );

        element.style.borderRightColor = safeColor(
          computed.borderRightColor,
          '#e2e8f0'
        );

        element.style.borderBottomColor = safeColor(
          computed.borderBottomColor,
          '#e2e8f0'
        );

        element.style.borderLeftColor = safeColor(
          computed.borderLeftColor,
          '#e2e8f0'
        );

        element.style.boxShadow = 'none';

        // Typography
        element.style.fontFamily =
          computed.fontFamily || 'Arial, sans-serif';

        element.style.fontSize =
          computed.fontSize;

        element.style.fontWeight =
          computed.fontWeight;

        element.style.lineHeight =
          computed.lineHeight;

        element.style.letterSpacing =
          computed.letterSpacing;

        element.style.textAlign =
          computed.textAlign as any;

        // Layout
        element.style.display =
          computed.display;

        element.style.position =
          computed.position;

        element.style.width =
          computed.width;

        element.style.height =
          computed.height;

        element.style.minWidth =
          computed.minWidth;

        element.style.minHeight =
          computed.minHeight;

        element.style.maxWidth =
          computed.maxWidth;

        element.style.maxHeight =
          computed.maxHeight;

        element.style.padding =
          computed.padding;

        element.style.margin =
          computed.margin;

        element.style.borderWidth =
          computed.borderWidth;

        element.style.borderStyle =
          computed.borderStyle;

        element.style.borderRadius =
          computed.borderRadius;

        element.style.overflow =
          computed.overflow;

        element.style.display =
          computed.display;

        element.style.flexDirection =
          computed.flexDirection;

        element.style.alignItems =
          computed.alignItems;

        element.style.justifyContent =
          computed.justifyContent;

        element.style.gap =
          computed.gap;
      });

      // -------------------------------------------------------
      // Make sure clone has a white background
      // -------------------------------------------------------

      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#0f172a';

      // -------------------------------------------------------
      // CAPTURE CLEAN CLONE
      // -------------------------------------------------------

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,

        // Important:
        // html2canvas should not render the clone through
        // the Tailwind stylesheet again.
        foreignObjectRendering: false,
      });

      console.log('Prescription captured.');

      // Remove clone after successful capture
      document.body.removeChild(clone);

      // -------------------------------------------------------
      // CREATE IMAGE
      // -------------------------------------------------------

      const imgData = canvas.toDataURL('image/png');

      // -------------------------------------------------------
      // CREATE A4 PDF
      // -------------------------------------------------------

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;

      // Leave small margins
      const margin = 8;
      const imgWidth = pageWidth - margin * 2;

      const imgHeight =
        (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // -------------------------------------------------------
      // FIRST PAGE
      // -------------------------------------------------------

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight - margin * 2;

      // -------------------------------------------------------
      // ADDITIONAL PAGES
      // -------------------------------------------------------

      while (heightLeft > 0) {
        position =
          margin -
          (imgHeight - heightLeft);

        pdf.addPage();

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= pageHeight - margin * 2;
      }

      // -------------------------------------------------------
      // FILE NAME
      // -------------------------------------------------------

      const patient = whatsappConsultation.patient;

      const patientName = patient
        ? `${patient.first_name}_${patient.last_name}`
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_-]/g, '')
        : 'Patient';

      const date = new Date(
        whatsappConsultation.created_at
      )
        .toISOString()
        .split('T')[0];

      const filename = `${patientName}_${date}.pdf`;

      console.log('PDF filename:', filename);

      // -------------------------------------------------------
      // DOWNLOAD PDF
      // -------------------------------------------------------

      pdf.save(filename);

      console.log(
        'Prescription PDF generated successfully.'
      );

      // Close modal
      setWhatsappConsultation(null);

    } catch (error) {
      console.error(
        'Prescription PDF generation failed:',
        error
      );

      alert(
        'Failed to generate prescription PDF. Please try again.'
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  // ---------------------------------------------------------
  // LOAD DATA
  // ---------------------------------------------------------

  useEffect(() => {
    loadPrescriptions();
  }, []);

  // ---------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------

  const filteredConsultations = consultations.filter((c) => {
    if (!search) return true;

    const q = search.toLowerCase();

    const patientName = c.patient
      ? `${c.patient.first_name} ${c.patient.last_name}`.toLowerCase()
      : '';

    const meds =
      c.prescriptions
        ?.map((p) => p.medicine_name.toLowerCase())
        .join(' ') || '';

    return (
      patientName.includes(q) ||
      meds.includes(q)
    );
  });

  // ---------------------------------------------------------
  // PRINT VIEW
  // ---------------------------------------------------------

  if (selectedConsultationForPrint && doctor) {
    return (
      <PrintPrescriptionView
        consultation={selectedConsultationForPrint}
        doctor={doctor}
        onBack={() =>
          setSelectedConsultationForPrint(null)
        }
      />
    );
  }

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            Prescription Records
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Archived medical prescriptions, dosage history,
            and print view generator
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />

        <input
          type="text"
          placeholder="Search by Patient Name or Medicine Name (e.g. Telmisartan)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* PRESCRIPTIONS LIST */}

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Loading prescription archives...
        </div>
      ) : filteredConsultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">

          <FileText className="w-10 h-10 text-slate-300 mx-auto" />

          <h3 className="font-bold text-slate-700 text-sm">
            No prescriptions found
          </h3>

          <p className="text-xs text-slate-400">
            Prescriptions generated during consultations
            will appear here.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {filteredConsultations.map((c) => {

            const patientName = c.patient
              ? `${c.patient.first_name} ${c.patient.last_name}`
              : 'Patient';

            return (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
              >

                {/* PRESCRIPTION HEADER */}

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {patientName}
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Code: {c.patient?.patient_code} • Issued:{' '}
                      {new Date(
                        c.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}

                  <div className="flex items-center gap-2">

                    {/* SEND WHATSAPP */}

                    <button
                      type="button"
                      onClick={() =>
                        handleSendWhatsApp(c)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />

                      <span>Send</span>
                    </button>

                    {/* PRINT */}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedConsultationForPrint(c)
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />

                      <span>Print Rx</span>
                    </button>

                  </div>

                </div>

                {/* PRESCRIBED MEDICINES */}

                <div className="space-y-1.5 text-xs">

                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    Prescribed Medicines (
                    {c.prescriptions?.length || 0}
                    )
                  </span>

                  <div className="divide-y divide-slate-100">

                    {c.prescriptions?.map((p, idx) => (

                      <div
                        key={idx}
                        className="py-1.5 flex items-center justify-between text-xs"
                      >

                        <span className="font-bold text-slate-800">
                          {p.medicine_name}
                        </span>

                        <span className="text-teal-700 font-semibold">
                          {p.frequency} ({p.duration})
                        </span>

                      </div>

                    ))}

                  </div>

                </div>

                {/* DIAGNOSIS */}

                {c.diagnosis &&
                  c.diagnosis.length > 0 && (

                    <div className="pt-2 border-t border-slate-100 text-xs">

                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Diagnosis:{' '}
                      </span>

                      <span className="font-semibold text-slate-700">
                        {c.diagnosis.join(', ')}
                      </span>

                    </div>

                  )}

              </div>
            );
          })}

        </div>
      )}

      {/* =====================================================
          HIDDEN PRESCRIPTION PREVIEW
      ===================================================== */}

      {whatsappConsultation && doctor && (

        <div
          id="whatsapp-prescription-preview"
          className="fixed left-[-10000px] top-0 w-[800px] bg-white"
          aria-hidden="true"
        >

          <PrintPrescriptionView
            consultation={whatsappConsultation}
            doctor={doctor}
            onBack={() => {}}
          />

        </div>

      )}

      {/* =====================================================
          WHATSAPP CONFIRMATION MODAL
      ===================================================== */}

      {whatsappConsultation && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

            {/* MODAL HEADER */}

            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Send Prescription
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Send this prescription to the patient's WhatsApp.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setWhatsappConsultation(null)
                }
                disabled={generatingPdf}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="px-6 py-5 space-y-5">

              {/* PATIENT */}

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Patient
                </p>

                <p className="text-sm font-bold text-slate-900 mt-1">
                  {whatsappConsultation.patient?.first_name}{' '}
                  {whatsappConsultation.patient?.last_name}
                </p>

                <p className="text-xs text-slate-500 mt-0.5">
                  Code:{' '}
                  {whatsappConsultation.patient?.patient_code}
                </p>

              </div>

              {/* WHATSAPP NUMBER */}

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  WhatsApp Number
                </p>

                <div className="flex items-center gap-2 mt-1.5">

                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">

                    <Send className="w-3.5 h-3.5 text-green-600" />

                  </div>

                  <p className="text-sm font-semibold text-green-700">
                    +91 {whatsappConsultation.patient?.phone}
                  </p>

                </div>

              </div>

              {/* PRESCRIPTION */}

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Prescription
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1">
  {whatsappConsultation.patient?.first_name}
  {whatsappConsultation.patient?.last_name
    ? `_${whatsappConsultation.patient.last_name}`
    : ''}
  _
  {new Date(
    whatsappConsultation.created_at
  )
    .toISOString()
    .split('T')[0]}
  .pdf
</p>

                <p className="text-xs text-slate-500 mt-1">
                  {whatsappConsultation.prescriptions?.length || 0}{' '}
                  medicine(s)
                </p>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">

              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  setWhatsappConsultation(null)
                }
                disabled={generatingPdf}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>

              {/* SEND */}

              <button
                type="button"
                onClick={handleConfirmWhatsApp}
                disabled={generatingPdf}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {generatingPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};