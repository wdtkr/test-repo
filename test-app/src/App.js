import React, { useState, useCallback } from "react";
import { Lock, Unlock, CheckCircle, XCircle } from "lucide-react";

// スケジュールデータと謎解きを定義するJSON構造
// ここを編集することで、予定内容と謎解きを変更・追加できます。
const scheduleData = {
  Day1: [
    {
      time: "10:00 - 12:00",
      plan: "サプライズランチ＆プレゼント！",
      riddle: "愛を込めて、彼女が一番好きな動物の名前をカタカナで答えてね。",
      answer: "ネコ",
      hint: "ヒント：私たちが一緒に飼いたいと思っている動物です。",
    },
    {
      time: "14:00 - 16:30",
      plan: "二人だけの秘密のアフタヌーンティー",
      riddle: "私たちの出会いの季節を漢字一文字で答えてね。",
      answer: "秋",
      hint: "ヒント：寒い季節と暑い季節の間にあります。",
    },
    {
      time: "18:30 - 21:00",
      plan: "夜景の見える特別なディナー",
      riddle:
        "私たちが初めてデートした場所の名前をひらがなで答えてね。（例：〇〇えん）",
      answer: "こうえん",
      hint: "ヒント：大きな木とベンチがある場所です。",
    },
  ],
  Day2: [
    {
      time: "10:30 - 12:00",
      plan: "思い出の場所へドライブデート",
      riddle: "私が彼女に最初に贈った花の名前をひらがなで答えてね。",
      answer: "バラ",
      hint: "ヒント：赤くてロマンチックな花です。",
    },
    {
      time: "13:00 - 15:00",
      plan: "手作り体験でペアグッズ作り",
      riddle: "私たちが初めて旅行に行った都道府県名をひらがなで答えてね。",
      answer: "おきなわ",
      hint: "ヒント：海がとてもきれいな南の島です。",
    },
    {
      time: "17:00 - 19:30",
      plan: "まったりおうちで映画鑑賞＆ケーキ",
      riddle: "このアプリを作った人の誕生日月を数字2桁で答えてね。",
      answer: "10",
      hint: "ヒント：私が生まれた月です。",
    },
  ],
};

// モーダルコンポーネント
const RiddleModal = ({ isOpen, onClose, scheduleItem, onSolve }) => {
  const [answerInput, setAnswerInput] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // 答えの検証ロジック
  const checkAnswer = () => {
    // 全角・半角、大文字・小文字を無視して比較
    const normalizedInput = answerInput.toLowerCase().trim();
    const normalizedCorrectAnswer = scheduleItem.answer.toLowerCase().trim();

    if (normalizedInput === normalizedCorrectAnswer) {
      setMessage("正解です！次の予定がアンロックされました！");
      setIsError(false);
      setTimeout(() => {
        onSolve(); // 予定を公開するコールバック
        // 成功時は親の onClose が呼ばれ、モーダルが閉じ、ステートがリセットされる
        onClose();
      }, 1500);
    } else {
      setMessage("残念、答えが違います。ヒントをよく見て考えてみてね！");
      setIsError(true);
      setTimeout(() => {
        setMessage("");
        setAnswerInput("");
      }, 3000);
    }
  };

  // モーダルが閉じるときに、次の開封のために内部ステートをリセットする処理
  // 今回は親の onClose には含まれていないが、ここで明示的にリセットする関数を渡すことも可能

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100 border-4 border-pink-400"
        onClick={(e) => e.stopPropagation()} // モーダル外のクリックで閉じないようにする
      >
        <h3 className="text-xl font-bold mb-4 text-pink-600 flex items-center">
          <Lock className="w-6 h-6 mr-2" /> 謎解きチャレンジ！
        </h3>
        <p className="mb-4 text-gray-700 font-medium whitespace-pre-wrap">
          {scheduleItem.riddle}
        </p>

        {/* ヒント表示エリア */}
        <details className="mb-4 text-sm text-gray-500 cursor-pointer">
          <summary className="font-semibold text-pink-500 hover:text-pink-600 transition-colors">
            ヒントを見る
          </summary>
          <p className="mt-2 p-2 bg-pink-50 border-l-4 border-pink-300 rounded">
            {scheduleItem.hint}
          </p>
        </details>

        <input
          type="text"
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          placeholder="ここに答えを入力してね"
          className="w-full p-3 mb-4 border-2 border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
          onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
        />

        <button
          onClick={checkAnswer}
          className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-98 mb-3"
        >
          答えをチェック！
        </button>

        {message && (
          <div
            className={`p-3 mt-3 rounded-xl flex items-center ${
              isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isError ? (
              <XCircle className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            <span className="font-semibold">{message}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-500 mt-2 hover:text-gray-700 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

// スケジュールテーブル行コンポーネント
const ScheduleRow = ({ item, isRevealed, onOpenRiddle }) => {
  return (
    <div className="flex border-b border-pink-200 last:border-b-0">
      {/* 時間列 */}
      <div className="w-1/3 p-3 bg-pink-100 font-semibold text-pink-700 flex items-center justify-center border-r border-pink-200">
        {item.time}
      </div>

      {/* 予定内容列 (謎解きエリア) */}
      <div
        className={`w-2/3 p-3 flex items-center transition-all duration-500 ease-in-out ${
          isRevealed
            ? "bg-white"
            : "bg-pink-300 cursor-pointer hover:bg-pink-400 active:bg-pink-500"
        }`}
        onClick={() => !isRevealed && onOpenRiddle(item)}
      >
        {isRevealed ? (
          // 答えが分かっている場合
          <div className="text-gray-800 font-medium flex items-center">
            <Unlock className="w-5 h-5 mr-2 text-green-600" />
            <span className="font-bold text-lg">{item.plan}</span>
          </div>
        ) : (
          // 謎解きが必要な場合
          <div className="text-white font-bold text-lg flex items-center justify-center w-full">
            <Lock className="w-6 h-6 mr-2" />
            タップして謎解きへ！
          </div>
        )}
      </div>
    </div>
  );
};

// メインアプリケーションコンポーネント
export default function App() {
  // const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

  // State for the selected day ('Day1' or 'Day2')
  const [selectedDay, setSelectedDay] = useState("Day1");

  // State to track which plans have been revealed (DayN: [index, ...])
  // NOTE: Firestoreは今回は使用せず、シンプルなアプリとしてuseStateで状態管理します。
  const [revealedPlans, setRevealedPlans] = useState({
    Day1: [], // Day1のアンロックされたインデックス
    Day2: [], // Day2のアンロックされたインデックス
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRiddle, setCurrentRiddle] = useState(null); // { day: 'Day1', index: 0, item: {...} }

  // 謎解きモーダルを開く処理
  const handleOpenRiddle = (item, index) => {
    setCurrentRiddle({ day: selectedDay, index: index, item: item });
    setIsModalOpen(true);
  };

  // 謎解きが解けた時の処理
  const handleSolveRiddle = useCallback(() => {
    if (currentRiddle) {
      setRevealedPlans((prev) => ({
        ...prev,
        [currentRiddle.day]: [...prev[currentRiddle.day], currentRiddle.index],
      }));
    }
  }, [currentRiddle]);

  const schedule = scheduleData[selectedDay];

  return (
    <div className="min-h-screen bg-pink-50 font-sans p-4 flex flex-col items-center">
      <script src="https://cdn.tailwindcss.com"></script>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />

      {/* GitHub Pagesで検索エンジンからのインデックス登録を防ぐための設定 */}
      <meta name="robots" content="noindex" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <style>{`
        body { font-family: 'Inter', sans-serif; }
        /* モバイルフレンドリーなレイアウト */
        .schedule-container {
            width: 100%;
            max-width: 600px;
        }
        /* Tailwind CSSのコンフィグ（font-familyなどを設定） */
        /* Lucide icons are used for visual appeal */
      `}</style>

      {/* ヘッダー */}
      <header className="w-full max-w-md text-center py-6">
        <h1 className="text-3xl font-black text-pink-700 mb-1">
          💖 Happy Birthday! 💖
        </h1>
        <p className="text-lg text-gray-600 font-semibold">
          特別な2日間スケジュール
        </p>
      </header>

      {/* デイ切り替えボタン */}
      <div className="w-full max-w-sm flex justify-center space-x-4 mb-6 p-1 bg-white rounded-xl shadow-lg">
        <button
          onClick={() => setSelectedDay("Day1")}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 text-lg w-1/2 ${
            selectedDay === "Day1"
              ? "bg-pink-500 text-white shadow-md"
              : "bg-white text-pink-500 hover:bg-pink-100"
          }`}
        >
          Day 1
        </button>
        <button
          onClick={() => setSelectedDay("Day2")}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 text-lg w-1/2 ${
            selectedDay === "Day2"
              ? "bg-pink-500 text-white shadow-md"
              : "bg-white text-pink-500 hover:bg-pink-100"
          }`}
        >
          Day 2
        </button>
      </div>

      {/* スケジュール表示エリア */}
      <main className="schedule-container bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-300">
        {/* テーブルヘッダー */}
        <div className="flex bg-pink-600 text-white font-extrabold text-lg">
          <div className="w-1/3 p-4 text-center">時間</div>
          <div className="w-2/3 p-4 text-center border-l border-pink-400">
            予定内容 (謎解きで公開！)
          </div>
        </div>

        {/* スケジュールリスト */}
        <div className="divide-y divide-pink-200">
          {schedule.map((item, index) => (
            <ScheduleRow
              key={index}
              item={item}
              isRevealed={revealedPlans[selectedDay].includes(index)}
              onOpenRiddle={() => handleOpenRiddle(item, index)}
            />
          ))}
        </div>
      </main>

      <p className="mt-8 text-center text-sm text-gray-400">
        アプリID:
        {/* {appId} */}
      </p>

      {/* 謎解きモーダル */}
      <RiddleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // 修正点: RiddleModal内のローカルなステートセッターを親から呼び出さないように削除しました
        }}
        scheduleItem={currentRiddle?.item || {}}
        onSolve={handleSolveRiddle}
      />
    </div>
  );
}
