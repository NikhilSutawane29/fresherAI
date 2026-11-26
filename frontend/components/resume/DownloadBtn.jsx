import React from "react";
import { FiDownload } from "react-icons/fi";
import { useReactToPrint } from "react-to-print";
import { useCoins } from "../../src/apis/user.api";

const DownloadBtn = ({ docRef, user, setUser }) => {
  const handlePdf = useReactToPrint({
    contentRef: docRef,
    documentTitle: "FresherAiPDF",
  });

  const handleDownload = async () => {
    // we want to decrease Ai credits or coins when user download it's resume in pdf

    try {
        // fetching use coins api - which is responsible to decrese our coins
      const coinResponse = await useCoins({
        coins: 10, // we minus 10 coins
        action: "download-pdf",
      });

      await handlePdf();

      // we update our interview coins after decreasing coins - means we update our current user with new session on Frontend
      setUser((prev) => ({
        ...prev, // we put old or remaining(...prev) all values are same
        interviewCoin: coinResponse?.interviewCoin, // we update interview coin
      }));
            
    } catch (error) {
      if (error.response?.status === 403) {
        return alert("Not enough Interview Coins.");
      }

      alert(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs text-white"
    >
      <FiDownload />
      Download PDF
    </button>
  );
};

export default DownloadBtn;
