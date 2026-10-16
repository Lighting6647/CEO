import { useState, useEffect } from 'react';
import { Database, Plus, Download, Clock, HardDrive } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { getBackupSnapshots, createNewSnapshot, downloadSnapshot } from '../../services/backupCronService';

export function BackupManagerModal({ isOpen, onClose, projects, auditLogs, onShowToast }) {
  const [snapshots, setSnapshots] = useState(getBackupSnapshots());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSnapshots(getBackupSnapshots());
    }
  }, [isOpen]);

  const handleCreateSnapshot = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newSnap = createNewSnapshot(projects, auditLogs, 'Manual Snapshot');
      setSnapshots(getBackupSnapshots());
      setIsCreating(false);
      onShowToast?.('success', 'สร้าง Snapshot สำเร็จ', `บันทึกข้อมูล ${newSnap.id} เรียบร้อยแล้ว`);
    }, 800);
  };

  const handleDownload = (snap) => {
    downloadSnapshot(snap);
    onShowToast?.('success', 'ดาวน์โหลด Snapshot สำเร็จ', `ไฟล์ ${snap.id}.json ถูกดาวน์โหลดลงเครื่องแล้ว`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💾 ระบบสำรองข้อมูลอัตโนมัติ (Scheduled Auto-Backup & Snapshots)" maxWidth="max-w-2xl">
      <div className="space-y-5 text-xs">
        {/* Banner */}
        <div className="rounded-xl border border-teal-500/30 bg-teal-950/40 p-4 text-teal-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-teal-300">
              <Database className="h-4 w-4" />
              <span>สถานะการสำรองข้อมูล: ทำงานอัตโนมัติ (Cron Retention Active)</span>
            </div>
            <button
              onClick={handleCreateSnapshot}
              disabled={isCreating}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 font-bold text-white hover:bg-teal-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {isCreating ? 'กำลังบันทึก...' : 'สร้าง Snapshot เดี๋ยวนี้'}
            </button>
          </div>
          <p className="mt-1 leading-relaxed text-teal-200/80">
            ระบบจัดเก็บประวัติผลการตรวจสอบ ดัชนีสุขภาพ 12 โปรเจกต์ และ State สำคัญ ย้อนหลังสูงสุด 10 Snapshot ล่าสุด
          </p>
        </div>

        {/* Snapshots List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">ประวัติการสำรองข้อมูล (Snapshot Archives)</h4>
          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{snap.id}</span>
                      <Badge variant="cyan" size="sm">{snap.type}</Badge>
                      <Badge variant="success" size="sm">{snap.healthIndex}% Health</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-slate-500" /> {snap.timestamp}
                      </span>
                      <span>•</span>
                      <span>ขนาด: {snap.size}</span>
                      <span>•</span>
                      <span>{snap.storageTarget}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(snap)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  title="ดาวน์โหลด JSON Snapshot"
                >
                  <Download className="h-3.5 w-3.5 text-teal-400" />
                  <span>โหลด</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 text-center">
          ระบบสำรองข้อมูลอัตโนมัติจะเก็บข้อมูลเฉพาะ 10 เวอร์ชั่นล่าสุดเพื่อรักษาพื้นที่จัดเก็บข้อมูลให้เหมาะสม
        </div>
      </div>
    </Modal>
  );
}
