import React, { useState } from 'react';
import { MapPin, Camera, CheckCircle2, XCircle, ShieldAlert, UserCheck } from 'lucide-react';

export const AttendanceGeofenceSimulator: React.FC = () => {
  const [distanceMeters, setDistanceMeters] = useState<number>(25);
  const [allowedRadius, setAllowedRadius] = useState<number>(50);
  const [fakeGPSDetected, setFakeGPSDetected] = useState<boolean>(false);
  const [livenessScore, setLivenessScore] = useState<number>(98);
  const [clockInTime, setClockInTime] = useState<string>('08:12'); // 8:12 AM
  const [shiftStart, setShiftStart] = useState<string>('08:00'); // 8:00 AM

  const isLocationValid = distanceMeters <= allowedRadius && !fakeGPSDetected;
  const isLivenessValid = livenessScore >= 85;

  // Calculate late minutes
  const [clockHour, clockMin] = clockInTime.split(':').map(Number);
  const [shiftHour, shiftMin] = shiftStart.split(':').map(Number);
  const clockInTotalMinutes = clockHour * 60 + clockMin;
  const shiftStartTotalMinutes = shiftHour * 60 + shiftMin;
  const lateMinutes = Math.max(0, clockInTotalMinutes - shiftStartTotalMinutes);

  const isSuccess = isLocationValid && isLivenessValid;

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#181818] text-indigo-400 border border-[#2a2a2a] rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-white">Simulator Absensi GPS Geofencing & Selfie</h3>
            <p className="text-xs text-gray-500">Uji validasi jarak lokasi kantor, skor deteksi keaslian wajah (liveness), dan keterlambatan</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="md:col-span-6 space-y-4 bg-[#0a0a0a] p-5 rounded-xl border border-[#1a1a1a]">
          <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Parameter Pengujian Mobile ESS</h4>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Jarak Karyawan ke Titik Kantor: <span className="font-bold text-indigo-400">{distanceMeters} Meter</span>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={distanceMeters}
              onChange={(e) => setDistanceMeters(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>0m (Tepat di Kantor)</span>
              <span>Radius Maksimal ({allowedRadius}m)</span>
              <span>200m (Luar Area)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Jam Masuk Shift</label>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Jam Clock-In Aktual</label>
              <input
                type="time"
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Skor Deteksi Wajah (Face Liveness): <span className="font-bold text-indigo-400">{livenessScore}%</span>
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={livenessScore}
              onChange={(e) => setLivenessScore(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
              <input
                type="checkbox"
                checked={fakeGPSDetected}
                onChange={(e) => setFakeGPSDetected(e.target.checked)}
                className="rounded border-[#262626] text-rose-600 focus:ring-rose-500 bg-[#141414]"
              />
              <span className="text-rose-400 font-semibold">Simulasikan Deteksi Fake GPS / Mock Location</span>
            </label>
          </div>
        </div>

        {/* Verification Card */}
        <div className="md:col-span-6 space-y-4">
          <div className={`p-5 rounded-xl border ${isSuccess ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-rose-950/40 border-rose-800/60'} transition-all`}>
            <div className="flex items-center gap-3 mb-3">
              {isSuccess ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
              )}
              <div>
                <h4 className={`text-base font-bold ${isSuccess ? 'text-emerald-200' : 'text-rose-200'}`}>
                  {isSuccess ? 'Clock-In Berhasil Disimpan' : 'Clock-In Ditolak Sistem'}
                </h4>
                <p className="text-xs text-gray-400">
                  {isSuccess ? 'Seluruh kriteria geofence & biometrik terpenuhi' : 'Terdapat pelanggaran kriteria keamanan atau lokasi'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-[#1a1a1a] pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Geofence Radius ({allowedRadius}m):</span>
                {distanceMeters <= allowedRadius ? (
                  <span className="font-semibold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Terpenuhi ({distanceMeters}m)</span>
                ) : (
                  <span className="font-semibold text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Luar Radius ({distanceMeters}m)</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Anti-Fake GPS Check:</span>
                {!fakeGPSDetected ? (
                  <span className="font-semibold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> GPS Asli (Valid)</span>
                ) : (
                  <span className="font-semibold text-rose-400 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Terdeteksi Fake GPS</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Face Recognition Liveness:</span>
                {isLivenessValid ? (
                  <span className="font-semibold text-emerald-400 flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Liveness {livenessScore}%</span>
                ) : (
                  <span className="font-semibold text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Liveness Rendah ({livenessScore}%)</span>
                )}
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-[#1a1a1a]">
                <span className="text-gray-400">Status Keterlambatan:</span>
                {lateMinutes > 0 ? (
                  <span className="font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded">Terlambat {lateMinutes} Menit</span>
                ) : (
                  <span className="font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">Tepat Waktu</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
