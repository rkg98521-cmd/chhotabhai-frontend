import React from 'react';

/**
 * Realistic vector product cutouts for all 15 ChhotaBhai mobile & lifestyle categories.
 * Rendered with authentic gradients, glossy reflections, and clean cutout aesthetics
 * matching premium consumer electronics brand showcases (boAt / Apple).
 */
export const CategoryIcon = ({ slug, className = 'w-10 h-10 sm:w-12 sm:h-12' }) => {
  switch (slug) {
    case 'tws-earbuds':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="tws-case" x1="14" y1="20" x2="50" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#14b8a6" />
              <stop offset="0.5" stopColor="#0d9488" />
              <stop offset="1" stopColor="#0f766e" />
            </linearGradient>
            <linearGradient id="tws-lid" x1="16" y1="12" x2="48" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5eead4" />
              <stop offset="1" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="tws-bud" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          {/* Subtle Pod Shadow */}
          <ellipse cx="32" cy="54" rx="16" ry="3" fill="#0f172a" fillOpacity="0.15" />
          {/* Main Case Body */}
          <rect x="14" y="24" width="36" height="28" rx="14" fill="url(#tws-case)" />
          {/* Case Seam Accent Line */}
          <path d="M14 36H50" stroke="#042f2e" strokeWidth="1" strokeOpacity="0.3" />
          {/* Interior Pod Cavity */}
          <path d="M16 26C16 19 23 14 32 14C41 14 48 19 48 26H16Z" fill="#134e4a" />
          {/* Left Earbud in cradle */}
          <ellipse cx="25" cy="20" rx="5" ry="6.5" fill="url(#tws-bud)" />
          <rect x="23" y="23" width="4" height="11" rx="2" fill="#e2e8f0" />
          <circle cx="25" cy="18" r="1.5" fill="#0f172a" />
          {/* Right Earbud in cradle */}
          <ellipse cx="39" cy="20" rx="5" ry="6.5" fill="url(#tws-bud)" />
          <rect x="37" y="23" width="4" height="11" rx="2" fill="#e2e8f0" />
          <circle cx="39" cy="18" r="1.5" fill="#0f172a" />
          {/* Open Flip Lid Silhouette */}
          <path d="M16 24C16 14 23 8 32 8C41 8 48 14 48 24" stroke="url(#tws-lid)" strokeWidth="3" strokeLinecap="round" />
          {/* Front Battery LED glow */}
          <circle cx="32" cy="42" r="2.2" fill="#34d399" />
          <circle cx="32" cy="42" r="1" fill="#ecfdf5" />
        </svg>
      );

    case 'smartwatches':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="sw-strap" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#94a3b8" />
              <stop offset="0.5" stopColor="#64748b" />
              <stop offset="1" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="sw-case" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#334155" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Drop shadow */}
          <ellipse cx="32" cy="56" rx="14" ry="2.5" fill="#0f172a" fillOpacity="0.15" />
          {/* Top Strap */}
          <rect x="23" y="4" width="18" height="15" rx="3" fill="url(#sw-strap)" />
          <line x1="26" y1="9" x2="38" y2="9" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="26" y1="13" x2="38" y2="13" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.5" />
          {/* Bottom Strap */}
          <rect x="23" y="45" width="18" height="15" rx="3" fill="url(#sw-strap)" />
          <line x1="26" y1="51" x2="38" y2="51" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="26" y1="55" x2="38" y2="55" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.5" />
          {/* Watch Metallic Case Bezel */}
          <rect x="14" y="15" width="36" height="34" rx="11" fill="url(#sw-case)" stroke="#94a3b8" strokeWidth="1.5" />
          {/* AMOLED Black Display Screen */}
          <rect x="17" y="18" width="30" height="28" rx="8" fill="#020617" />
          {/* Digital Activity Rings (Red, Green, Cyan) */}
          <circle cx="32" cy="32" r="10" stroke="#ef4444" strokeWidth="2" strokeDasharray="38 25" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="32" r="7" stroke="#10b981" strokeWidth="1.8" strokeDasharray="28 20" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="32" r="4.5" stroke="#06b6d4" strokeWidth="1.6" strokeDasharray="16 15" strokeLinecap="round" fill="none" />
          {/* Rotational Digital Crown Button */}
          <rect x="50" y="27" width="3.5" height="7" rx="1.5" fill="#cbd5e1" />
        </svg>
      );

    case 'wireless-neckbands':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="nb-grad" x1="14" y1="16" x2="50" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#334155" />
              <stop offset="0.5" stopColor="#0f172a" />
              <stop offset="1" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="15" ry="2.5" fill="#0f172a" fillOpacity="0.12" />
          {/* Ergonomic Neckband Collar Arc */}
          <path
            d="M17 48C14 38 17 24 26 17C29 14.5 35 14.5 38 17C47 24 50 38 47 48"
            stroke="url(#nb-grad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Metallic Weighted Pods with Controls */}
          <rect x="13.5" y="36" width="6.5" height="15" rx="3.2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          <circle cx="16.7" cy="41" r="1" fill="#38bdf8" />
          <rect x="44" y="36" width="6.5" height="15" rx="3.2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          {/* Fast-flex Earphone Wires */}
          <path d="M16.7 51Q18 58 23 55L27 42" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M47.3 51Q46 58 41 55L37 42" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" />
          {/* Magnetic Earbud Tips (Snapping together) */}
          <circle cx="27" cy="41" r="4" fill="#0f172a" stroke="#e11938" strokeWidth="1.2" />
          <circle cx="37" cy="41" r="4" fill="#0f172a" stroke="#e11938" strokeWidth="1.2" />
          <ellipse cx="32" cy="41" rx="1.5" ry="2" fill="#e11938" />
        </svg>
      );

    case 'wireless-headphones':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="hp-cushion" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#dc2626" />
              <stop offset="1" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="hp-band" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#1e293b" />
              <stop offset="0.5" stopColor="#475569" />
              <stop offset="1" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="54" rx="18" ry="3" fill="#0f172a" fillOpacity="0.15" />
          {/* Headband Arc */}
          <path
            d="M14 36C14 20 22 10 32 10C42 10 50 20 50 36"
            stroke="url(#hp-band)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Padded Leather Top Cushion */}
          <path d="M22 11.5C26 10 38 10 42 11.5" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
          {/* Metal Extension Sliders */}
          <rect x="11.5" y="26" width="5" height="8" rx="1.5" fill="#cbd5e1" />
          <rect x="47.5" y="26" width="5" height="8" rx="1.5" fill="#cbd5e1" />
          {/* Left Earcup with Memory Foam Cushion */}
          <rect x="8" y="30" width="11" height="20" rx="5.5" fill="url(#hp-cushion)" stroke="#450a0a" strokeWidth="1" />
          <rect x="11" y="33" width="5" height="14" rx="2.5" fill="#0f172a" />
          {/* Right Earcup with Memory Foam Cushion */}
          <rect x="45" y="30" width="11" height="20" rx="5.5" fill="url(#hp-cushion)" stroke="#450a0a" strokeWidth="1" />
          <rect x="48" y="33" width="5" height="14" rx="2.5" fill="#0f172a" />
        </svg>
      );

    case 'wireless-speakers':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="spk-body" x1="20" y1="16" x2="44" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#334155" />
              <stop offset="0.5" stopColor="#0f172a" />
              <stop offset="1" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="spk-glow" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#06b6d4" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="55" rx="13" ry="3" fill="#0f172a" fillOpacity="0.18" />
          {/* Cylindrical Rugged Body */}
          <rect x="20" y="15" width="24" height="38" rx="12" fill="url(#spk-body)" stroke="#475569" strokeWidth="1.2" />
          {/* Acoustic Fabric Micro-Mesh Texture */}
          <line x1="26" y1="26" x2="38" y2="26" stroke="#64748b" strokeWidth="1.8" strokeDasharray="2 2" />
          <line x1="24" y1="31" x2="40" y2="31" stroke="#64748b" strokeWidth="1.8" strokeDasharray="2 2" />
          <line x1="24" y1="36" x2="40" y2="36" stroke="#64748b" strokeWidth="1.8" strokeDasharray="2 2" />
          <line x1="26" y1="41" x2="38" y2="41" stroke="#64748b" strokeWidth="1.8" strokeDasharray="2 2" />
          {/* Top Passive Bass Radiator Cap */}
          <ellipse cx="32" cy="17" rx="11" ry="4" fill="url(#spk-glow)" />
          <ellipse cx="32" cy="17" rx="7" ry="2.5" fill="#0f172a" />
          {/* Carry Lanyard Loop */}
          <path d="M41 21C46 21 47 28 44 32" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'camera-drones':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="54" rx="18" ry="3" fill="#0f172a" fillOpacity="0.15" />
          {/* 4 Carbon-Fiber Quad Arms */}
          <line x1="16" y1="20" x2="48" y2="44" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="16" y1="44" x2="48" y2="20" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          {/* High-speed Propeller Blades */}
          <ellipse cx="15" cy="18" rx="8" ry="2.2" fill="#94a3b8" />
          <ellipse cx="49" cy="18" rx="8" ry="2.2" fill="#94a3b8" />
          <ellipse cx="15" cy="46" rx="8" ry="2.2" fill="#94a3b8" />
          <ellipse cx="49" cy="46" rx="8" ry="2.2" fill="#94a3b8" />
          {/* Brushless Motor Caps */}
          <circle cx="15" cy="18" r="2" fill="#e11938" />
          <circle cx="49" cy="18" r="2" fill="#e11938" />
          <circle cx="15" cy="46" r="2" fill="#e11938" />
          <circle cx="49" cy="46" r="2" fill="#e11938" />
          {/* Aerodynamic Fuselage Body */}
          <rect x="24" y="23" width="16" height="18" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          {/* 4K Optical Camera Gimbal Eye */}
          <circle cx="32" cy="32" r="4.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="31" cy="31" r="1.5" fill="#ffffff" />
        </svg>
      );

    case 'soundbars':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="48" rx="24" ry="2.5" fill="#0f172a" fillOpacity="0.15" />
          {/* Horizontal Soundbar Body */}
          <rect x="6" y="27" width="52" height="13" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          {/* Metal Front Acoustic Grille */}
          <line x1="12" y1="33" x2="52" y2="33" stroke="#64748b" strokeWidth="2.5" strokeDasharray="2 3" />
          {/* Center LED Display Matrix */}
          <rect x="29" y="32" width="6" height="2" rx="0.5" fill="#38bdf8" />
          {/* Base Rubber Stands */}
          <rect x="14" y="40" width="6" height="2" rx="1" fill="#64748b" />
          <rect x="44" y="40" width="6" height="2" rx="1" fill="#64748b" />
        </svg>
      );

    case 'dashcams':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="52" rx="14" ry="2.5" fill="#0f172a" fillOpacity="0.14" />
          {/* Windshield Suction Arm */}
          <path d="M32 10V22M22 10H42" stroke="#64748b" strokeWidth="2.8" strokeLinecap="round" />
          {/* Dashcam Compact Housing */}
          <rect x="16" y="22" width="32" height="24" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          {/* Multi-element 2K Wide Angle Lens */}
          <circle cx="32" cy="34" r="8.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="32" cy="34" r="5.5" fill="#0369a1" />
          <circle cx="30" cy="32" r="1.8" fill="#ffffff" />
          {/* REC Status Dot */}
          <circle cx="43" cy="26" r="1.5" fill="#ef4444" />
        </svg>
      );

    case 'projectors':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="52" rx="16" ry="2.5" fill="#0f172a" fillOpacity="0.15" />
          {/* Projector Compact Cinema Cube */}
          <rect x="14" y="24" width="36" height="22" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          {/* Optical Glass Lens Bevel */}
          <circle cx="24" cy="35" r="7.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="24" cy="35" r="5" fill="#0284c7" />
          <circle cx="22" cy="33" r="1.8" fill="#ffffff" />
          {/* Cooling Vents */}
          <line x1="36" y1="31" x2="45" y2="31" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="36" y1="35" x2="45" y2="35" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="36" y1="39" x2="45" y2="39" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Top Focus Wheel */}
          <rect x="21" y="21" width="6" height="3" rx="1" fill="#cbd5e1" />
        </svg>
      );

    case 'back-cases':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <defs>
            <linearGradient id="case-shell" x1="20" y1="10" x2="44" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e293b" />
              <stop offset="0.5" stopColor="#0f172a" />
              <stop offset="1" stopColor="#334155" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="57" rx="11" ry="2" fill="#0f172a" fillOpacity="0.15" />
          {/* Matte Phone Protective Shell */}
          <rect x="20" y="9" width="24" height="46" rx="7" fill="url(#case-shell)" stroke="#64748b" strokeWidth="1.5" />
          {/* Camera Island Bump */}
          <rect x="23" y="12" width="10" height="12" rx="3" fill="#020617" stroke="#475569" strokeWidth="1" />
          <circle cx="28" cy="15.5" r="1.8" fill="#38bdf8" />
          <circle cx="28" cy="20" r="1.8" fill="#38bdf8" />
          {/* MagSafe Magnetic Array Ring */}
          <circle cx="32" cy="35" r="8" stroke="#f8fafc" strokeWidth="1.6" strokeDasharray="3.5 2" fill="none" />
          <line x1="32" y1="43" x2="32" y2="47" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'tempered-glass':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="57" rx="11" ry="2" fill="#0f172a" fillOpacity="0.12" />
          {/* 9H Diamond Glass Silhouette */}
          <rect x="20" y="9" width="24" height="46" rx="6" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.6" />
          {/* Earpiece Speaker Cutout */}
          <line x1="28" y1="12.5" x2="36" y2="12.5" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round" />
          {/* Crystal Bevel Diagonal Glint */}
          <path d="M22 47L38 12H42L26 47H22Z" fill="#38bdf8" fillOpacity="0.4" />
          {/* Diamond Hardness Sparkle */}
          <path d="M37 17L38.5 20L41.5 21.5L38.5 23L37 26L35.5 23L32.5 21.5L35.5 20L37 17Z" fill="#0284c7" />
          <circle cx="25" cy="40" r="1.2" fill="#38bdf8" />
        </svg>
      );

    case 'fast-wall-chargers':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="54" rx="15" ry="2.5" fill="#0f172a" fillOpacity="0.15" />
          {/* Wall Socket Prongs */}
          <rect x="22" y="8" width="4" height="9" rx="1.5" fill="#94a3b8" />
          <rect x="38" y="8" width="4" height="9" rx="1.5" fill="#94a3b8" />
          {/* GaN Power Adapter Body */}
          <rect x="16" y="16" width="32" height="34" rx="7" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Dual USB-C Rapid Ports */}
          <rect x="24" y="24" width="16" height="4.5" rx="2" fill="#0f172a" />
          <rect x="24" y="32" width="16" height="4.5" rx="2" fill="#0f172a" />
          {/* 65W Turbo Text */}
          <text x="32" y="44" textAnchor="middle" fill="#e11938" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
            65W GaN
          </text>
        </svg>
      );

    case 'braided-data-cables':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="54" rx="16" ry="2.5" fill="#0f172a" fillOpacity="0.15" />
          {/* Heavy-Duty Braided Nylon Coils */}
          <ellipse cx="32" cy="34" rx="17" ry="13" stroke="#e11938" strokeWidth="3.2" strokeDasharray="3 2" fill="none" />
          <ellipse cx="32" cy="34" rx="13" ry="9" stroke="#1e293b" strokeWidth="3.2" strokeDasharray="3 2" fill="none" />
          {/* CNC Aluminum Alloy Type-C Head */}
          <rect x="11" y="24" width="9" height="15" rx="2.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="13" y="17" width="5" height="7" rx="1" fill="#cbd5e1" />
          <line x1="13.5" y1="28" x2="17.5" y2="28" stroke="#e11938" strokeWidth="1.5" />
        </svg>
      );

    case 'camera-lens-protectors':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="55" rx="15" ry="2.5" fill="#0f172a" fillOpacity="0.15" />
          {/* Triple Aircraft Aluminum Camera Protector Rings */}
          <circle cx="25" cy="23" r="8.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="25" cy="23" r="5.5" fill="#0284c7" />
          <circle cx="23" cy="21" r="1.8" fill="#ffffff" />

          <circle cx="41" cy="27" r="8.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="41" cy="27" r="5.5" fill="#0284c7" />
          <circle cx="39" cy="25" r="1.8" fill="#ffffff" />

          <circle cx="28" cy="42" r="8.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="28" cy="42" r="5.5" fill="#0284c7" />
          <circle cx="26" cy="40" r="1.8" fill="#ffffff" />
        </svg>
      );

    case 'magsafe-mounts':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="56" rx="12" ry="2.5" fill="#0f172a" fillOpacity="0.15" />
          {/* Circular Magnetic Face Mount */}
          <circle cx="32" cy="27" r="16.5" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
          {/* Neodymium Magnet Alignment Ring */}
          <circle cx="32" cy="27" r="11" stroke="#f8fafc" strokeWidth="2.2" strokeDasharray="3.5 3" fill="none" />
          <circle cx="32" cy="27" r="3.5" fill="#e11938" />
          {/* 360-degree Pivot Ball & Air Vent Grip Clip */}
          <rect x="29" y="43" width="6" height="8" rx="2" fill="#475569" />
          <path d="M25 51H39M27 55H37" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <circle cx="32" cy="32" r="18" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M32 20V44M20 32H44" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};

export default CategoryIcon;
