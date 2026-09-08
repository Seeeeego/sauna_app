'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { REGIONS, Region } from '@/constants/japan';

export default function JapanMap() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const handlePrefClick = (prefName: string) => {
    // 選択された都道府県の施設一覧ページへ遷移
    router.push(`/facilities?prefecture=${encodeURIComponent(prefName)}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-md border border-slate-100">
      <h2 className="text-xl font-bold text-center text-slate-800 mb-6">
        ♨️ エリア・都道府県からサウナ・温泉を探す
      </h2>

      {/* エリア選択ボタン (モバイル・タブレット用バッジ) */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setSelectedRegion(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            selectedRegion === null
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          全国表示
        </button>
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => setSelectedRegion(region)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              selectedRegion?.id === region.id
                ? 'ring-2 ring-offset-2 ring-slate-800 font-bold'
                : 'opacity-90 hover:opacity-100'
            } ${region.color}`}
          >
            {region.name}
          </button>
        ))}
      </div>

      {/* 都道府県ボタン一覧エリア */}
      <div className="space-y-6">
        {REGIONS.filter(
          (region) => selectedRegion === null || selectedRegion.id === region.id
        ).map((region) => (
          <div key={region.id} className="border-b border-slate-100 pb-4 last:border-none">
            <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full inline-block ${region.color}`} />
              {region.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {region.prefs.map((pref) => (
                <button
                  key={pref}
                  onClick={() => handlePrefClick(pref)}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition hover:border-slate-300 hover:shadow-sm active:scale-95"
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}