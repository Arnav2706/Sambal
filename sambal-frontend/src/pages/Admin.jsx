import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Activity, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const mockClaims = [
    { id: 'CLM-001', worker: 'Ramesh K.', zone: 'Koramangala', event: 'Heavy Rain', amount: '₹1,200', status: 'Paid', aiConf: '98%' },
    { id: 'CLM-002', worker: 'Suresh M.', zone: 'HSR Layout', event: 'Heavy Rain', amount: '₹800', status: 'Paid', aiConf: '95%' },
    { id: 'CLM-003', worker: 'Abdul P.', zone: 'Indiranagar', event: 'Bandh', amount: '₹1,500', status: 'Processing', aiConf: '82%' },
    { id: 'CLM-004', worker: 'Vikram S.', zone: 'Whitefield', event: 'Heatwave', amount: '₹600', status: 'Denied', aiConf: '99%' },
    { id: 'CLM-005', worker: 'Manoj T.', zone: 'Koramangala', event: 'Heavy Rain', amount: '₹1,200', status: 'Paid', aiConf: '97%' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500">Monitor AI models and policy metrics in real-time.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { title: "Active Policies", val: "12,450", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-100" },
             { title: "Pending Claims", val: "45", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
             { title: "Claims Paid (24h)", val: "₹1.4L", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-100" },
             { title: "AI Confidence Avg", val: "96.4%", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-100" }
           ].map((stat, i) => (
             <Card key={i}>
                <CardContent className="p-6 flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                     <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>

        <Card>
          <CardContent className="p-0">
             <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-semibold text-slate-800">Recent Claims (Automated + Manual)</h3>
               <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Live Update</span>
             </div>
             <Table>
                <TableHeader>
                   <TableRow>
                     <TableHead>Claim ID</TableHead>
                     <TableHead>Worker</TableHead>
                     <TableHead>Zone</TableHead>
                     <TableHead>Trigger Event</TableHead>
                     <TableHead>AI Conf.</TableHead>
                     <TableHead>Amount</TableHead>
                     <TableHead>Status</TableHead>
                   </TableRow>
                </TableHeader>
                <tbody>
                   <AnimatePresence>
                     {mockClaims.map((claim, i) => (
                       <motion.tr 
                         key={claim.id} 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: i * 0.1 }}
                         className="bg-white border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                       >
                         <TableCell className="font-medium text-slate-900">{claim.id}</TableCell>
                         <TableCell className="text-slate-600">{claim.worker}</TableCell>
                         <TableCell className="text-slate-600">{claim.zone}</TableCell>
                         <TableCell className="text-slate-600">{claim.event}</TableCell>
                         <TableCell>
                            <span className="inline-flex items-center gap-1">
                               <Activity className="w-3 h-3 text-indigo-500" />
                               <span className="text-sm font-mono text-indigo-700">{claim.aiConf}</span>
                            </span>
                         </TableCell>
                         <TableCell className="font-semibold text-slate-800">{claim.amount}</TableCell>
                         <TableCell>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                               claim.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                               claim.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                               {claim.status}
                            </span>
                         </TableCell>
                       </motion.tr>
                     ))}
                   </AnimatePresence>
                </tbody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
