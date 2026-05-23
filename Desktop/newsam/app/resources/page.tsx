"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartHandshake, Bell, Users, LayoutDashboard, BookOpen,
  FileVideo, MessageCircle, Settings, LogOut, ChevronRight,
  ChevronDown, X, Menu, Phone, Home, Clock, RefreshCw,
  Navigation, Activity, LifeBuoy, AlertTriangle, Search,BarChart2
} from "lucide-react";
import { getUserProfile } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────
type LegalKey = keyof typeof legalContent;

type NearbyPlace = {
  name: string;
  dist: string;
  type: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  lat: number;
  lng: number;
};

// ─── Legal Content ───────────────────────────────────────────────
const legalContent = {
  "Protection of Women Act": {
    title: "Protection of Women from Domestic Violence Act, 2066 (2009)",
    tag: "Read", tagColor: "#7c3aed", tagBg: "#f5f3ff", icon: "ti-book",
    sections: [
      { heading: "What is domestic violence?", body: "Under this Act, domestic violence includes physical, mental, sexual, and economic abuse committed by one family member against another. This includes beating, threatening, humiliating, isolating, withholding money, or forcing unwanted sexual contact." },
      { heading: "Who is protected?", body: "Any person living in the same household — including spouses, children, parents, siblings, and in-laws — is protected. The Act applies regardless of gender." },
      { heading: "How to file a complaint", body: "You can file a complaint at the nearest police office or court. Complaints can also be filed by a neighbour, social worker, or NGO on your behalf. The police must register the case within 24 hours." },
      { heading: "What orders can the court give?", body: "The court can issue a protection order stopping the abuser from contacting you, a residence order requiring the abuser to leave the shared home, and a monetary relief order for medical expenses, loss of income, and psychological damage." },
      { heading: "Punishment for violation", body: "If a person violates a court protection order, they can be imprisoned for up to 6 months or fined up to NPR 50,000, or both. Repeat violations carry heavier sentences." },
    ],
  },
  "Your rights during arrest": {
    title: "Your Legal Rights During Arrest in Nepal",
    tag: "Read", tagColor: "#7c3aed", tagBg: "#f5f3ff", icon: "ti-gavel",
    sections: [
      { heading: "Right to be informed", body: "Under Article 20 of the Constitution of Nepal, you have the right to be informed immediately of the grounds for your arrest. The police must tell you why you are being detained." },
      { heading: "Right to legal counsel", body: "You have the right to consult and be defended by a legal practitioner of your choice. If you cannot afford one, you are entitled to free legal aid provided by the government." },
      { heading: "Right against self-incrimination", body: "You cannot be forced to testify against yourself. Any statement given under coercion or torture is inadmissible in court. You have the right to remain silent." },
      { heading: "24-hour production rule", body: "The police must produce you before a judge within 24 hours of arrest excluding travel time. Without judicial remand, they cannot detain you beyond this period." },
      { heading: "Right against torture", body: "Torture and cruel or degrading treatment in custody is prohibited by both the Constitution and the Torture Compensation Act. If tortured, you can file a complaint and claim compensation." },
      { heading: "Search and seizure", body: "Police generally require a warrant to search your home. In emergencies they may search without one, but must produce a warrant within 24 hours. You can ask to see the warrant before allowing entry." },
    ],
  },
  "File an FIR online": {
    title: "How to File a First Information Report (FIR)",
    tag: "Portal", tagColor: "#1d4ed8", tagBg: "#eff6ff", icon: "ti-clipboard-text",
    sections: [
      { heading: "What is an FIR?", body: "An FIR is the first document registered by the police when they receive information about a cognizable offence. It sets the criminal law in motion. Registering an FIR is your legal right — police cannot refuse." },
      { heading: "Online FIR — Nepal Police portal", body: "You can register an FIR online at nepalpolice.gov.np. Click Online Complaint, fill in the incident details, your contact information, and submit. You will receive a complaint number via SMS." },
      { heading: "In-person FIR", body: "Visit the nearest District Police Office or Police Beat. Ask the duty officer for an FIR form. Describe the incident in your own words — date, time, location, persons involved, and nature of the offence. The officer must register it and give you a copy." },
      { heading: "If police refuse to file your FIR", body: "If police refuse, send a written complaint by registered post to the Superintendent of Police of the district. You can also file a complaint directly at the Chief District Officer's office or approach the National Human Rights Commission." },
      { heading: "What to include", body: "Include your full name, address, and contact number. Describe the incident factually — what happened, when, where, and who was involved. Attach any evidence such as photos, screenshots, or medical reports. Keep a copy of everything you submit." },
    ],
  },
  "Free legal aid centers": {
    title: "Free Legal Aid Centers in Nepal",
    tag: "Nearby", tagColor: "#15803d", tagBg: "#f0fdf4", icon: "ti-users",
    sections: [
      { heading: "District Legal Aid Committee", body: "Every district in Nepal has a government-run District Legal Aid Committee. They provide free legal representation, advice, and mediation services to people who cannot afford a private lawyer. Visit your District Court premises to locate them." },
      { heading: "Forum for Women, Law and Development (FWLD)", body: "FWLD provides free legal aid specifically for women and marginalized groups. They operate legal aid clinics and can file cases on your behalf. Contact: +977-1-4102923 | fwld@fwld.org" },
      { heading: "Informal Sector Service Centre (INSEC)", body: "INSEC offers human rights documentation and legal support across Nepal. They assist with cases involving torture, arbitrary detention, and discrimination. Reach them at +977-1-4278770." },
      { heading: "Saathi", body: "Saathi provides free legal aid and counseling for survivors of gender-based violence. They have offices in Kathmandu and partner districts. Call: 1145 (toll-free helpline, office hours)." },
      { heading: "Who qualifies for free aid?", body: "Anyone who cannot financially afford legal representation qualifies. This includes survivors of violence, persons with disabilities, senior citizens, children, and those below the poverty line. You may need to show proof of income." },
    ],
  },
  "Property & Inheritance Rights": {
    title: "Property & Inheritance Rights for Women in Nepal",
    tag: "Read", tagColor: "#7c3aed", tagBg: "#f5f3ff", icon: "ti-home",
    sections: [
      { heading: "Constitutional guarantee", body: "Article 38 of the Constitution of Nepal guarantees women equal rights to ancestral property. Women have the same right as men to inherit and own property from their family lineage." },
      { heading: "Ancestral property rights", body: "Under the National Civil Code 2017, daughters have equal rights to ancestral property as sons. A daughter can claim her share at any time, and this right does not expire upon marriage." },
      { heading: "Marital property", body: "Property acquired during marriage is considered joint property of both spouses. In the event of divorce or death, the wife is entitled to her share of the jointly acquired property." },
      { heading: "Land registration", body: "Women can register land solely in their own name. The government has incentive programs offering discounts on registration fees for land registered in a woman's name or jointly. Visit your local Land Revenue Office to register." },
      { heading: "Contesting a will", body: "If you believe a will is unfair or forged, you can challenge it in court within 35 days of it being made public. Consult a lawyer or free legal aid center to file a petition. Bring all relevant documents including the original will, property records, and your relationship proof." },
      { heading: "How to claim your share", body: "Visit the District Court in the district where the property is located. File an application for partition of property. You may need a lawyer. If you cannot afford one, approach the District Legal Aid Committee. The court will summon all parties and mediate a partition." },
    ],
  },
  "Marriage & Divorce Laws": {
    title: "Marriage & Divorce Laws in Nepal",
    tag: "Read", tagColor: "#be185d", tagBg: "#fdf2f8", icon: "ti-heart",
    sections: [
      { heading: "Legal age of marriage", body: "The legal minimum age for marriage in Nepal is 20 years for both men and women. Marriage below this age is illegal and punishable. If you were married as a minor, the marriage can be declared void in court." },
      { heading: "Child marriage — what to do", body: "Child marriage is a criminal offence under the National Civil Code 2017. If you know of a child marriage taking place, report it to the police, the local Women and Children Office, or call the Women's Helpline at 1145. The perpetrators including the parents can face imprisonment." },
      { heading: "Grounds for divorce", body: "Under Nepali law, either spouse can file for divorce on grounds including cruelty, desertion for more than 3 years, conversion to another religion without consent, impotency, or mutual consent. A woman can also file if her husband takes a second wife." },
      { heading: "How to file for divorce", body: "File a petition at the District Court in your district. You will need your marriage certificate, identity documents, and evidence supporting your grounds for divorce. The court will attempt reconciliation first. If unsuccessful, a divorce decree is issued. The process typically takes 6–18 months." },
      { heading: "Alimony and maintenance", body: "You can apply for interim maintenance (monthly support) during divorce proceedings. The court considers the husband's income and your needs. After divorce, you may be entitled to a lump-sum settlement or ongoing maintenance depending on the circumstances." },
      { heading: "Child custody", body: "Courts prioritize the best interests of the child. Children under 5 typically stay with the mother. Older children's preferences are considered. Both parents retain visitation rights unless there is evidence of abuse. Custody orders can be modified if circumstances change." },
    ],
  },
  "Workplace Rights": {
    title: "Workplace Rights & Sexual Harassment Laws in Nepal",
    tag: "Read", tagColor: "#1d4ed8", tagBg: "#eff6ff", icon: "ti-briefcase",
    sections: [
      { heading: "What counts as workplace harassment?", body: "Under the Sexual Harassment at Workplace Prevention Act 2015, sexual harassment includes unwanted physical contact, sexually suggestive remarks, displaying pornographic material, sexual demands in exchange for employment benefits, or creating a hostile work environment through sexual behavior." },
      { heading: "Your right to a safe workplace", body: "Every employer with 10 or more employees must form a Complaint Handling Committee to address harassment complaints. If your workplace does not have one, that itself is a violation you can report to the Department of Labour." },
      { heading: "How to file a complaint", body: "First submit a written complaint to your workplace Complaint Handling Committee. The committee must resolve the complaint within 60 days. If the committee is absent or biased, you can file directly with the District Administration Office or the Department of Women, Children and Senior Citizens." },
      { heading: "Maternity leave rights", body: "Under the Labour Act 2017, female employees are entitled to 98 days of paid maternity leave (14 weeks). At least 60 days must be taken after delivery. You cannot be dismissed during pregnancy or maternity leave. Paternity leave of 15 days is also provided to fathers." },
      { heading: "Retaliation is illegal", body: "If your employer demotes, dismisses, or punishes you for reporting harassment, that is illegal retaliation. You can file a complaint with the Labour Office and claim reinstatement and compensation." },
      { heading: "Equal pay", body: "Article 18 of the Constitution guarantees equal pay for equal work regardless of gender. If you are paid less than a male colleague doing the same job, you can file a complaint with the Department of Labour or take it to the Labour Court." },
    ],
  },
  "Cyber Crime & Online Harassment": {
    title: "Cyber Crime & Online Harassment Laws in Nepal",
    tag: "Read", tagColor: "#7c3aed", tagBg: "#f5f3ff", icon: "ti-device-laptop",
    sections: [
      { heading: "What counts as cybercrime?", body: "Under the Electronic Transactions Act 2006 and the National Penal Code 2017, cybercrimes include hacking, online fraud, cyberstalking, sharing someone's private images without consent, blackmail using digital content, creating fake profiles to defame someone, and sending threatening messages online." },
      { heading: "Non-consensual image sharing", body: "Sharing someone's intimate images without their consent is a criminal offence punishable by up to 5 years imprisonment and a fine. This applies whether the images were taken consensually or not. Victims can also seek an injunction to have images removed." },
      { heading: "Reporting fake profiles and impersonation", body: "If someone creates a fake profile using your name, photos, or identity, report it immediately on the platform (Facebook, Instagram etc.) and file a cybercrime complaint at the Nepal Police Cyber Bureau. Call 1166 or visit the Cyber Bureau office in Kathmandu." },
      { heading: "Blackmail and online threats", body: "If someone threatens to share your private content unless you pay money or comply with demands, do not pay. Save all evidence including screenshots, messages, and call logs. File a complaint with the Cyber Bureau immediately. This is extortion and carries heavy penalties." },
      { heading: "How to file a cybercrime complaint", body: "Visit the Nepal Police Cyber Bureau at Naxal, Kathmandu, or file online at cybercrime.police.gov.np. Bring screenshots, URLs, usernames, and any other digital evidence. You can also file at your nearest district police office." },
      { heading: "Evidence preservation tips", body: "Before reporting, take screenshots of all messages, profiles, posts, and threats. Note down URLs, usernames, and timestamps. Do not delete conversations even if they are distressing. This evidence is critical for your case." },
    ],
  },
  "Child Protection Laws": {
    title: "Child Protection Laws in Nepal",
    tag: "Read", tagColor: "#15803d", tagBg: "#f0fdf4", icon: "ti-baby-carriage",
    sections: [
      { heading: "Definition of a child", body: "Under Nepali law, anyone below 18 years of age is considered a child and is entitled to special legal protections. These protections apply regardless of gender, ethnicity, or socioeconomic status." },
      { heading: "Child abuse — what to report", body: "Child abuse includes physical abuse, sexual abuse, emotional abuse, and neglect. If you witness or suspect any form of abuse, you are legally encouraged to report it. Failure to report known abuse can itself be penalized." },
      { heading: "How to report child abuse", body: "Call the Child Helpline at 1098 (toll-free, 24/7). You can also report to the nearest Women and Children Service Centre at your district police office, the local Women and Children Office, or organizations like CWIN Nepal (+977-1-4278034)." },
      { heading: "Child labour laws", body: "Children under 14 cannot be employed in any work. Children aged 14–18 cannot be employed in hazardous work. Employers who violate this face imprisonment of up to 3 years. If you see a child being made to work, report it to the Department of Labour or the Child Helpline 1098." },
      { heading: "Child sexual abuse", body: "Sexual abuse of a child is punishable by 5 to 15 years imprisonment depending on severity. Cases should be reported immediately to police. A medical examination will be arranged. The child's identity is kept confidential throughout the legal process." },
      { heading: "Central Child Welfare Board (CCWB)", body: "CCWB coordinates child protection across Nepal. They handle cases of child trafficking, abuse, and exploitation. Contact them at +977-1-4229381 or through your local District Child Welfare Board office." },
    ],
  },
  "Human Trafficking": {
    title: "Human Trafficking — Rights, Recognition & Reporting in Nepal",
    tag: "Read", tagColor: "#b91c1c", tagBg: "#fff1f2", icon: "ti-shield-lock",
    sections: [
      { heading: "What is human trafficking?", body: "Human trafficking is the recruitment, transportation, transfer, or receipt of people using force, fraud, or deception for the purpose of exploitation. This includes sexual exploitation, forced labour, forced marriage, or organ removal." },
      { heading: "Warning signs", body: "Warning signs include someone offering a job abroad that seems too good to be true, a recruiter who asks for your passport or identity documents, being asked to repay travel costs through work, being transported without knowing your destination, or being controlled by someone who limits your freedom." },
      { heading: "Nepal's anti-trafficking law", body: "The Human Trafficking and Transportation Control Act 2007 criminalizes trafficking with penalties of 20 years to life imprisonment for serious offences. Victims cannot be prosecuted for crimes they were forced to commit during trafficking." },
      { heading: "Survivor rights", body: "Survivors have the right to free legal aid, medical treatment, psychological counseling, and rehabilitation support. Their identities are protected throughout legal proceedings. Compensation can be claimed from the trafficker through the court." },
      { heading: "How to report trafficking", body: "Call the Women's Helpline 1145 or the National Human Rights Commission at +977-1-4200418. Contact Maiti Nepal at 1800-419-8588 (toll-free). You can also file a report at any district police office. Reports can be made anonymously." },
      { heading: "Safe migration tips", body: "Always verify job offers abroad through the Department of Foreign Employment (DoFE). Check that your recruiter is licensed. Never hand over your passport to anyone. Keep a copy of all your documents. Register with the Nepali Embassy upon arrival abroad. Call DoFE at 1180 for free pre-departure information." },
    ],
  },
  "Restraining Orders": {
    title: "Restraining Orders in Nepal — How to Get Protected",
    tag: "Read", tagColor: "#c2410c", tagBg: "#fff7ed", icon: "ti-ban",
    sections: [
      { heading: "What is a restraining order?", body: "A restraining order (also called a protection order in Nepal) is a court order that legally prohibits a person from contacting, approaching, or harassing you. Violating a restraining order is a criminal offence." },
      { heading: "Who can apply?", body: "Anyone who has experienced or fears domestic violence, stalking, sexual harassment, or threats can apply. You do not need to have been physically harmed. Fear of imminent harm is sufficient grounds." },
      { heading: "How to apply", body: "File an application at your District Court or through the nearest police station. In urgent cases, police can grant temporary protection immediately. The court will then hold a hearing within 15 days and issue a formal order. You can apply yourself or through a lawyer or NGO." },
      { heading: "What a restraining order covers", body: "A restraining order can prohibit the person from entering your home, workplace, or locality. It can ban them from contacting you by phone, message, or through third parties. It can require them to stay a specified distance away from you at all times." },
      { heading: "If the order is violated", body: "Call police immediately if the person violates the order. Show police the court order. Violations are punishable by imprisonment of up to 6 months and a fine. Keep a record of every violation including dates, times, and witnesses." },
      { heading: "Renewing or modifying the order", body: "Restraining orders can be renewed before expiry if the threat continues. If circumstances change (for example, the person moves away), you can apply to modify or lift the order. Always keep your court order document with you." },
    ],
  },
  "Right to Healthcare": {
    title: "Right to Healthcare After Violence in Nepal",
    tag: "Read", tagColor: "#15803d", tagBg: "#f0fdf4", icon: "ti-heart-plus",
    sections: [
      { heading: "Free emergency treatment — your right", body: "Under the National Health Policy and the Right to Health Act, all government hospitals must provide free emergency treatment to survivors of violence, rape, and domestic abuse. No hospital can refuse you or demand payment upfront in an emergency." },
      { heading: "Medical examination after assault", body: "If you have been sexually assaulted, seek medical care as soon as possible — ideally within 72 hours. A medical examination documents injuries and collects evidence for your case. You have the right to have a female doctor examine you. You can request this." },
      { heading: "Hospitals with special cells", body: "Several hospitals in Nepal have dedicated One-Stop Crisis Management Centres (OCMC) where police, medical, legal, and psychosocial support are provided under one roof. These include Tribhuvan University Teaching Hospital, Patan Hospital, Bir Hospital, and most provincial hospitals." },
      { heading: "Mental health rights", body: "The Mental Health Policy 2096 recognizes mental healthcare as a fundamental right. Survivors of violence are entitled to free psychosocial counseling at government health facilities. You cannot be forced to undergo psychiatric treatment without your informed consent." },
      { heading: "Confidentiality", body: "Medical professionals are bound by confidentiality. However, they are legally required to report certain crimes including sexual assault of minors to police. If you are an adult, your information will not be shared without your consent unless required by a court." },
      { heading: "What to bring when seeking care", body: "Bring any identity document if you have one, but hospitals cannot refuse you for lacking ID. If you have experienced violence, do not shower, change clothes, or clean up before the medical examination — this preserves critical evidence. A support person can accompany you throughout." },
    ],
  },
};

// ─── Static data ─────────────────────────────────────────────────
const hotlines = [
  { name: "Police",           number: "100",   sub: "24/7 emergency",    color: "#b91c1c", bg: "#fff1f2", icon: "ti-shield" },
  { name: "Ambulance",        number: "102",   sub: "Medical emergency", color: "#c2410c", bg: "#fff7ed", icon: "ti-ambulance" },
  { name: "Women's helpline", number: "1091",  sub: "Women in distress", color: "#be185d", bg: "#fdf2f8", icon: "ti-gender-female" },
  { name: "Mental health",    number: "iCall", sub: "Counseling support", color: "#7c3aed", bg: "#f5f3ff", icon: "ti-brain" },
  { name: "Legal aid",        number: "15100", sub: "Free legal help",   color: "#1d4ed8", bg: "#eff6ff", icon: "ti-scale" },
];

const guides = [
  { title: "How to use SOS",       desc: "Step-by-step SOS activation and what happens next",     icon: "ti-sos",              color: "#b91c1c", bg: "#fff1f2" },
  { title: "Location sharing",     desc: "How live location is shared with your trusted contacts", icon: "ti-map-pin",          color: "#15803d", bg: "#f0fdf4" },
  { title: "Personal safety tips", desc: "Everyday precautions and awareness practices",           icon: "ti-shield-check",     color: "#7c3aed", bg: "#f5f3ff" },
  { title: "Filing a complaint",   desc: "How to report an incident to police or authorities",     icon: "ti-file-description", color: "#c2410c", bg: "#fff7ed" },
];

const nearbyPlaces: NearbyPlace[] = [
  { name: "Police Station", dist: "0.2 km", type: "Police",   icon: "ti-building",         iconColor: "#b91c1c", iconBg: "#fff1f2", lat: 27.676516926387947, lng: 85.33677308585585},
  { name: "Bir Hospital",          dist: "1.2 km", type: "Hospital", icon: "ti-building-hospital", iconColor: "#15803d", iconBg: "#f0fdf4", lat: 27.7041, lng: 85.3145 },
  { name: "Saathi NGO shelter",    dist: "2.1 km", type: "Shelter",  icon: "ti-home-heart",        iconColor: "#be185d", iconBg: "#fdf2f8", lat: 27.7089, lng: 85.3200 },
  { name: "Kathmandu Legal Aid",   dist: "3.0 km", type: "Legal",    icon: "ti-scale",             iconColor: "#1d4ed8", iconBg: "#eff6ff", lat: 27.7100, lng: 85.3240 },
];

const community = [
  { name: "Saathi Nepal",    desc: "Support for GBV survivors",   phone: "1145",          icon: "ti-heart-handshake", iconColor: "#be185d", iconBg: "#fdf2f8" },
  { name: "FWLD",            desc: "Women & legal rights",        phone: "+977-1-4102923", icon: "ti-scale",           iconColor: "#7c3aed", iconBg: "#f5f3ff" },
  { name: "iCall counseling",desc: "Free mental health sessions", phone: "9152987821",     icon: "ti-brain",           iconColor: "#1d4ed8", iconBg: "#eff6ff" },
  { name: "Maiti Nepal",     desc: "Anti-trafficking support",    phone: "1800-419-8588",  icon: "ti-shield-heart",    iconColor: "#15803d", iconBg: "#f0fdf4" },
];

// All legal items — 12 total
const legalKeys = Object.keys(legalContent) as LegalKey[];

// Group them for display
const legalCategories = [
  {
    heading: "Core rights",
    items: ["Protection of Women Act", "Your rights during arrest", "File an FIR online", "Free legal aid centers"] as LegalKey[],
  },
  {
    heading: "Family & property",
    items: ["Property & Inheritance Rights", "Marriage & Divorce Laws"] as LegalKey[],
  },
  {
    heading: "Workplace & digital",
    items: ["Workplace Rights", "Cyber Crime & Online Harassment"] as LegalKey[],
  },
  {
    heading: "Safety & protection",
    items: ["Child Protection Laws", "Human Trafficking", "Restraining Orders", "Right to Healthcare"] as LegalKey[],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────
function getInitials(value: string) {
  if (!value) return "SA";
  const cleaned = value.split("@")[0];
  const parts = cleaned.split(/[.\s_-]+/).filter(Boolean);
  return (parts[0]?.[0] || cleaned[0] || "S").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

// ─── Legal Modal ─────────────────────────────────────────────────
function LegalModal({ item, onClose }: { item: LegalKey; onClose: () => void }) {
  const content = legalContent[item];
  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}>
      <div onClick={e => e.stopPropagation()}
        className="bg-white rounded-[18px] w-full max-w-[600px] flex flex-col shadow-2xl"
        style={{ maxHeight: "85vh" }}>

        {/* Header */}
        <div className="flex justify-between items-start gap-3 p-6 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: legalContent[item].tagBg }}>
              <i className={`ti ${legalContent[item].icon} text-lg`} style={{ color: legalContent[item].tagColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: "#AD1457" }}>Legal resource</p>
              <h2 className="text-[15px] font-bold text-slate-900 leading-snug">{content.title}</h2>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {content.sections.map((s, i) => (
            <div key={i} className={i < content.sections.length - 1 ? "mb-5 pb-5 border-b border-slate-50" : "mb-2"}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full" style={{ background: "#D81B60" }} />
                <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-slate-700">{s.heading}</p>
              </div>
              <p className="text-sm text-slate-600 leading-7 pl-3">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 100%)" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Map Modal ───────────────────────────────────────────────────
function MapModal({ place, onClose }: { place: NearbyPlace; onClose: () => void }) {
  const mapSrc = `https://maps.google.com/maps?q=${place.lat},${place.lng}&z=16&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}>
      <div onClick={e => e.stopPropagation()}
        className="bg-white rounded-[18px] w-full max-w-[560px] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: place.iconBg }}>
              <i className={`ti ${place.icon} text-lg`} style={{ color: place.iconColor }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{place.name}</p>
              <p className="text-xs text-slate-400">{place.dist} away · {place.type}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div style={{ height: 320 }}>
          <iframe title={place.name} src={mapSrc} width="100%" height="100%"
            style={{ border: "none", display: "block" }} allowFullScreen loading="lazy" />
        </div>
        <div className="p-4 flex gap-3">
          <a href={directionsUrl} target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 100%)" }}>
            <Navigation className="w-4 h-4" /> Open in Google Maps
          </a>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-rose-200 text-rose-700 hover:bg-rose-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ResourcesPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [contacts, setContacts]         = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [now, setNow]                   = useState<Date>(new Date());
  const [search, setSearch]             = useState("");
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [legalModal, setLegalModal] = useState<LegalKey | null>(null);
  const [mapPlace, setMapPlace]     = useState<NearbyPlace | null>(null);

  const contactCount = contacts.length;
  const userInitials = getInitials(email);

  // Filter legal items by search
  const filteredCategories = legalCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(key =>
      search === "" ||
      key.toLowerCase().includes(search.toLowerCase()) ||
      legalContent[key].title.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    getUserProfile()
      .then(res => {
        setEmail(res.data.user.email);
        setContacts(res.data.user.emergencyContacts ?? []);
      })
      .catch(() => { console.error("Failed to load profile"); });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setProfileOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [profileOpen]);

  function handleSignOut() { localStorage.clear(); router.push("/"); }

  type NavItem = {
    icon: React.ElementType;
    label: string;
    active?: boolean;
  } & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Bell,            label: "SOS",       href: "/dashboard" },
    { icon: Users,           label: "Contacts",  href: "/dashboard" },
    { icon: FileVideo,       label: "Reports",   href: "/report" },
    { icon: MessageCircle,   label: "Problems",  href: "/problems" },
    { icon: BookOpen,        label: "Resources", href: "/resources", active: true },
    { icon: BarChart2,       label: "Analysis",  href: "/analysis" },
  ];

  return (
    <div className="min-h-screen flex"
      style={{ background: "linear-gradient(180deg,rgba(248,250,252,1) 0%,rgba(245,247,255,1) 46%,rgba(248,250,252,1) 100%)" }}>

      {/* ── Sidebar ── */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col
          bg-card border-r border-border shadow-xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 100%)" }}>
                <HeartHandshake className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-foreground text-base tracking-tight">Samrakshya</span>
            </Link>
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-border shrink-0">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-700">Status: Safe</p>
                  <p className="text-[10px] text-emerald-600/70 truncate">{email || "—"}</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[11px] text-emerald-700/80">
                {contactCount} trusted contact{contactCount === 1 ? "" : "s"} connected
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ icon: Icon, label, href, onClick, active }) => {
              const cls = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full text-left ${
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`;
              const inner = (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "group-hover:text-foreground"}`} />
                  {label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />}
                </>
              );
              return href ? (
                <Link key={label} href={href} className={cls}>{inner}</Link>
              ) : (
                <button key={label} type="button" onClick={onClick} className={cls}>{inner}</button>
              );
            })}

            <div>
              <button type="button" onClick={() => setSettingsOpen(v => !v)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full text-left ${
                  settingsOpen ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                <Settings className="w-4 h-4 shrink-0" />
                Settings
                <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${settingsOpen ? "rotate-90" : ""}`} />
              </button>
              {settingsOpen && (
                <div className="mt-1 ml-3 pl-4 border-l-2 border-border space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 100%)" }}>
                      {userInitials}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email || "—"}</p>
                  </div>
                  <button type="button" onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50">
                    <LogOut className="w-4 h-4 shrink-0" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>

          <div className="px-4 pb-4 shrink-0">
            <Link href="/dashboard"
              className="w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", boxShadow: "0 4px 14px rgba(185,28,28,0.35)" }}>
              <Phone className="w-4 h-4" /> Quick SOS
            </Link>
          </div>
        </aside>
      </>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ── */}
        <header className="sticky top-0 z-30 border-b backdrop-blur-xl backdrop-saturate-150 shrink-0 border-rose-200/60 shadow-[0_10px_30px_-12px_rgba(173,20,87,0.18)]"
          style={{ background: "rgba(253,232,240,0.75)" }}>

          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(900px 100px at 10% -30%, rgba(216,27,96,0.07), transparent 60%), radial-gradient(700px 80px at 90% -20%, rgba(173,20,87,0.06), transparent 60%)" }} />

          <div className="relative flex h-[60px] items-center gap-3 px-4 sm:px-6">
            <button className="lg:hidden -ml-1 flex h-9 w-9 items-center justify-center rounded-[10px] text-slate-700 transition-colors hover:bg-rose-50 hover:text-[#AD1457]"
              onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex flex-col leading-tight">
              <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-[#AD1457]">
                  <Home className="w-3 h-3" /><span>Home</span>
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span style={{ color: "#AD1457" }}>Resources</span>
              </nav>
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">Resources</h2>
                <span className="hidden md:inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider border-emerald-200 bg-emerald-50 text-emerald-700">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Safe
                </span>
              </div>
            </div>

            <div className="flex-1" />

            <div className="hidden md:flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white/70 px-2 py-1 font-mono text-[10.5px] tracking-[0.1em] text-slate-600">
              <Clock className="w-3 h-3" />
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            <button type="button" aria-label="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/25 hover:text-[#AD1457]">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <Link href="/report"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-[10px] border-2 border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/30 hover:text-[#AD1457]">
              <FileVideo className="w-3.5 h-3.5" /> Report
            </Link>

            <Link href="/dashboard"
              className="group relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-[10px] px-3 text-[12.5px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 55%, #7f1d1d 100%)", boxShadow: "0 8px 22px -8px rgba(185,28,28,0.6)" }}>
              <span className="relative z-10 inline-flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SOS</span>
              </span>
              <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <div className="hidden md:block h-7 w-px bg-gradient-to-b from-transparent via-rose-200 to-transparent" />

            <div className="relative" ref={profileRef}>
              <button type="button" onClick={() => setProfileOpen(v => !v)}
                className="flex h-9 items-center gap-2 rounded-[10px] border-2 border-slate-200 bg-white pl-1 pr-2 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none">
                <span className="relative flex h-7 w-7 items-center justify-center rounded-[8px] text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 100%)", boxShadow: "0 4px 12px -4px rgba(173,20,87,0.5)" }}>
                  {userInitials}
                  <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white bg-emerald-500" />
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div role="menu" className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-[12px] border border-slate-100 bg-white shadow-2xl">
                  <div className="flex items-center gap-3 px-3 py-3 text-white"
                    style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 55%, #880E4F 100%)" }}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15 text-[13px] font-bold">{userInitials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">Signed in as</p>
                      <p className="truncate text-[13px] font-semibold">{email || "—"}</p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <Link href="/" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <Home className="w-4 h-4" /> Home
                    </Link>
                    <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/report" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <FileVideo className="w-4 h-4" /> Report Incident
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    <button type="button" onClick={() => { setProfileOpen(false); handleSignOut(); }}
                      className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-rose-700 transition-colors hover:bg-rose-50">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Context strip */}
          <div className="relative hidden md:block border-t border-rose-100/60"
            style={{ background: "linear-gradient(to right, rgba(255,241,245,0.4), rgba(255,255,255,0.4), rgba(255,241,245,0.4))" }}>
            <div className="flex h-9 items-center justify-between gap-4 px-4 sm:px-6 text-[11px] font-semibold">
              <div className="flex items-center gap-2.5 text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <Navigation className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">Location · standby</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <Users className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">{contactCount} contact{contactCount !== 1 ? "s" : ""}</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <Activity className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">{legalKeys.length} legal guides available</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500">
                <span className="hidden lg:inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-emerald-700 tracking-wider">connected</span>
                </span>
                <span className="hidden xl:inline-block h-3 w-px bg-slate-200" />
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  <span className="font-mono tracking-wider">sync {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
                <span className="hidden xl:inline-block h-3 w-px bg-slate-200" />
                <a href="tel:100" className="hidden xl:inline-flex items-center gap-1 font-bold text-red-700 hover:text-red-800">
                  <Phone className="w-3 h-3" /> Police · 100
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <main className="flex-1 px-4 sm:px-6 pt-5 pb-8 space-y-6 overflow-y-auto">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-slate-950 px-6 py-8 text-white shadow-2xl md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,27,96,0.25),transparent_30%),radial-gradient(circle_at_left,rgba(168,85,247,0.18),transparent_25%)]" />
            <div className="relative z-10 flex items-center justify-between gap-6">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Normal mode active
                </div>
                <h2 className="text-2xl font-black tracking-tight md:text-3xl max-w-lg">
                  Safety resources & legal guidance, all in one place.
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/60 max-w-lg">
                  {legalKeys.length} legal guides, emergency helplines, safety guides, and nearby safe spaces — everything you need, fast.
                </p>
              </div>
              <div className="hidden md:flex w-20 h-20 rounded-full items-center justify-center shrink-0"
                style={{ background: "rgba(216,27,96,0.2)", border: "1px solid rgba(216,27,96,0.3)" }}>
                <LifeBuoy className="w-9 h-9" style={{ color: "#f9a8d4" }} />
              </div>
            </div>
          </div>

          {/* Emergency Hotlines */}
          <section>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-3">Emergency helplines</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {hotlines.map(h => (
                <div key={h.name} className="bg-white border border-border/60 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: h.bg }}>
                    <i className={`ti ${h.icon} text-lg`} style={{ color: h.color }} />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{h.name}</p>
                  <p className="text-xl font-black" style={{ color: h.color }}>{h.number}</p>
                  <p className="text-[10px] text-slate-400">{h.sub}</p>
                  <a href={`tel:${h.number}`} className="text-[11px] font-semibold flex items-center gap-1 mt-auto" style={{ color: h.color }}>
                    <Phone className="w-3 h-3" /> Call now
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Safety Guides */}
          <section>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-3">Safety guides</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {guides.map(g => (
                <div key={g.title}
                  className="bg-white border border-border/60 rounded-2xl p-4 flex gap-3 items-start cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: g.bg }}>
                    <i className={`ti ${g.icon} text-xl`} style={{ color: g.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 mb-1">{g.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{g.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 self-center" />
                </div>
              ))}
            </div>
          </section>

          {/* ── Legal Guidance — full section ── */}
          <section>
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">Legal guidance</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{legalKeys.length} guides · tap any to read in full</p>
              </div>
              {/* Search */}
              <div className="flex items-center gap-2 bg-white border border-border/60 rounded-xl px-3 py-2 w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search legal guides…"
                  className="text-sm text-slate-700 bg-transparent outline-none w-full placeholder:text-slate-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {filteredCategories.map(cat => (
                <div key={cat.heading} className="bg-white border border-border/60 rounded-2xl overflow-hidden">
                  {/* Category header */}
                  <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2"
                    style={{ background: "linear-gradient(to right, rgba(253,232,240,0.5), transparent)" }}>
                    <div className="w-1.5 h-4 rounded-full" style={{ background: "#D81B60" }} />
                    <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: "#AD1457" }}>{cat.heading}</p>
                    <span className="ml-auto text-[10px] font-semibold text-slate-400">{cat.items.length} guide{cat.items.length !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-50">
                    {cat.items.map(key => {
                      const item = legalContent[key];
                      return (
                        <div key={key} onClick={() => setLegalModal(key)}
                          className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-rose-50 group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.tagBg }}>
                              <i className={`ti ${item.icon} text-base`} style={{ color: item.tagColor }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 truncate">{key}</p>
                              <p className="text-[11px] text-slate-400 truncate">{item.sections.length} sections · {item.title.slice(0, 48)}…</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="hidden sm:inline text-[11px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ color: item.tagColor, background: item.tagBg }}>
                              {item.tag}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="bg-white border border-border/60 rounded-2xl p-10 text-center">
                  <p className="text-sm font-semibold text-slate-500">No guides match &ldquo;{search}&rdquo;</p>
                  <button onClick={() => setSearch("")} className="mt-2 text-xs font-semibold" style={{ color: "#AD1457" }}>Clear search</button>
                </div>
              )}
            </div>
          </section>

          {/* Nearby + Community */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-border/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-900">Nearby safe spaces</p>
              </div>
              <div className="space-y-1">
                {nearbyPlaces.map(p => (
                  <div key={p.name} onClick={() => setMapPlace(p)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors hover:bg-emerald-50 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.iconBg }}>
                        <i className={`ti ${p.icon} text-sm`} style={{ color: p.iconColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.dist} · {p.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <Navigation className="w-3 h-3" /> Go
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fdf2f8" }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: "#AD1457" }} />
                </div>
                <p className="text-sm font-bold text-slate-900">Community & support</p>
              </div>
              <div className="space-y-1">
                {community.map(c => (
                  <div key={c.name} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-rose-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.iconBg }}>
                        <i className={`ti ${c.icon} text-sm`} style={{ color: c.iconColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.desc}</p>
                      </div>
                    </div>
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#AD1457" }}>
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      {legalModal && <LegalModal item={legalModal} onClose={() => setLegalModal(null)} />}
      {mapPlace   && <MapModal   place={mapPlace}  onClose={() => setMapPlace(null)} />}
    </div>
  );
}