import React, {useState} from 'react';
import {MapPin, Search} from 'lucide-react';
import {navigate} from '../../../../shared/public-site.js';
interface CoverageCheckerProps {onSelectPlan?:()=>void; variant?:'compact'|'full'}
export const CoverageChecker: React.FC<CoverageCheckerProps> = () => {
  const [address,setAddress]=useState('');
  return <div className="w-full max-w-3xl mx-auto"><form onSubmit={event=>{event.preventDefault();navigate('coverage',{address});}} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl md:rounded-full border border-[#e0e0e0]">
    <label className="flex items-center gap-3 pl-4 flex-1 w-full"><MapPin className="w-5 h-5 text-[#ED101A] shrink-0" aria-hidden="true"/><span className="sr-only">Street or estate</span><input value={address} onChange={event=>setAddress(event.target.value)} placeholder="Enter your street or estate" className="min-w-0 w-full py-3 bg-transparent text-[#1d1d1f] text-base"/></label>
    <button className="ik-btn-primary w-full sm:w-auto" type="submit"><Search className="w-4 h-4" aria-hidden="true"/>Check Coverage</button>
  </form><p className="mt-3 text-sm text-[#62626a]">Availability is subject to address verification.</p></div>;
};
