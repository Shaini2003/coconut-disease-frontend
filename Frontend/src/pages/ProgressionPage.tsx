// Frontend/src/pages/ProgressionPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, ImageIcon, RefreshCw, FileText, History, CheckCircle } from 'lucide-react';
import { useTranslation } from '../i18n';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ProgressionPage() {
    const { language } = useTranslation();
    const isSi = language === 'si';
    const [image1, setImage1] = useState<string | null>(null);
    const [image2, setImage2] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            const userId = localStorage.getItem('user_id') || 1;
            const res = await axios.get(`http://localhost:5000/api/progression/history/${userId}`);
            setHistory(res.data);
        } catch (err) { console.log("History load error"); }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImage: (val: string) => void) => {
        const file = e.target.files?.[0];
        if (file) setImage(URL.createObjectURL(file));
    };

    const startAnalysis = async () => {
        if (!image1 || !image2) return;
        setIsAnalyzing(true);
        try {
            const response = await axios.post('http://localhost:5000/api/progression/calculate', {
                userId: localStorage.getItem('user_id') || 1,
                diseaseName: 'Bud Rot', oldScore: 85, newScore: 32
            });
            setResult(response.data);
            fetchHistory();
        } catch (err) { alert("Error!"); } finally { setIsAnalyzing(false); }
    };

    const downloadPDF = async () => {
        const input = document.getElementById('history-table'); 
        if (!input) return;

        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();

        pdf.text("Coconut Disease Progression Report", 14, 15);
        pdf.addImage(imgData, 'PNG', 10, 25, 180, 0); 
        pdf.save('progression_report.pdf');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-green-800 to-emerald-700 text-white py-12 px-6 shadow-md mb-8">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-3xl font-extrabold mb-3">{isSi ? 'රෝග වර්ධනය නිරීක්ෂණය' : 'Disease Progression Tracker'}</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4">
                {/* Upload & Analyze */}
                {!result && !isAnalyzing && (
                    <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <label className="w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400">
                                {image1 ? <img src={image1} className="w-full h-full object-cover rounded-2xl" /> : <><Upload className="w-10 h-10 text-gray-400" /><p>{isSi ? 'පැරණි පින්තූරය' : 'Previous Image'}</p></>}
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, setImage1)} />
                            </label>
                            <label className="w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
                                {image2 ? <img src={image2} className="w-full h-full object-cover rounded-2xl" /> : <><ImageIcon className="w-10 h-10 text-gray-400" /><p>{isSi ? 'වත්මන් පින්තූරය' : 'Current Image'}</p></>}
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, setImage2)} />
                            </label>
                        </div>
                        <button onClick={startAnalysis} disabled={!image1 || !image2} className="w-full mt-10 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
                            {isSi ? 'ප්‍රගතිය විශ්ලේෂණය කරන්න' : 'Analyze Progression'}
                        </button>
                    </div>
                )}

                {/* Result & History Section */}
                {result && (
                    <div className="bg-white rounded-3xl shadow-xl p-10 text-center mb-8">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-green-700">{result.improvement}% Recovery!</h2>
                        <button onClick={() => { setResult(null); setImage1(null); setImage2(null); }} className="mt-6 text-gray-500 font-semibold flex mx-auto items-center">
                            <RefreshCw className="w-4 h-4 mr-2" /> {isSi ? 'නව පරීක්ෂණයක්' : 'Start New'}
                        </button>
                    </div>
                )}

                <div id="history-table" className="bg-white p-6 rounded-2xl shadow-md">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center"><History className="mr-2" /> Recent History</h2>
                        <button onClick={downloadPDF} className="flex items-center text-blue-600 font-semibold"><FileText className="mr-2" /> Export PDF</button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 border-b">
                                <th className="py-3">Date</th>
                                <th>Disease</th>
                                <th>Old Score</th>
                                <th>New Score</th>
                                <th>Status</th>
                                <th>Improvement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h, i) => (
                                <tr key={i} className="border-t">
                                    <td className="py-3">{h.created_at ? h.created_at.split('T')[0] : '-'}</td>
                                    <td>{h.disease_name}</td>
                                    <td>{h.old_score}%</td>
                                    <td>{h.new_score}%</td>
                                    <td>
                                        <span className={`px-2 py-1 rounded-full text-xs ${h.status === 'Recovering' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {h.status}
                                        </span>
                                    </td>
                                    <td className="font-bold">{h.improvement_percent}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}