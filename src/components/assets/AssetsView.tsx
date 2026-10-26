import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpdeskStorageService } from '../../services/storage';
import { Asset } from '../../types/helpdesk';
import { Laptop, Monitor, Key, Server, Search, ShieldCheck } from 'lucide-react';

export const AssetsView: React.FC = () => {
  const { currentUser, isEmployee } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const assets = useMemo(() => {
    let list = HelpdeskStorageService.getAssets();
    if (isEmployee) {
      // Employees see assets registered to their account
      list = list.filter((a) => a.ownerId === currentUser.id);
    }
    return list;
  }, [currentUser, isEmployee]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (typeFilter !== 'ALL' && a.assetType !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.assetTag.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [assets, search, typeFilter]);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'LAPTOP':
      case 'DESKTOP':
        return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'MONITOR':
        return <Monitor className="w-5 h-5 text-indigo-600" />;
      case 'SOFTWARE_LICENSE':
        return <Key className="w-5 h-5 text-amber-600" />;
      default:
        return <Server className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {isEmployee ? 'My Assigned Corporate Assets' : 'Enterprise Hardware & Software Inventory'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployee
              ? 'Devices and licensed tools associated with your employee account.'
              : 'Physical workstations, mobile testbeds, monitors, and allocated developer software licenses.'}
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search asset tag, model, serial..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700"
        >
          <option value="ALL">All Asset Types</option>
          <option value="LAPTOP">Laptops</option>
          <option value="MONITOR">Monitors</option>
          <option value="SOFTWARE_LICENSE">Software Licenses</option>
          <option value="SERVER">Servers</option>
        </select>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
            No assets registered or matching the filter.
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div key={asset.id} className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-slate-50 rounded-md">{getAssetIcon(asset.assetType)}</div>
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {asset.assetTag}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{asset.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{asset.assetType.replace('_', ' ')}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                {asset.serialNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serial No</span>
                    <span className="font-mono text-slate-700">{asset.serialNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold text-emerald-600">{asset.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
