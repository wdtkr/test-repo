import React, { useState, useCallback, useRef, useEffect } from "react";
import { Lock, Unlock, CheckCircle, XCircle, Gift, Info } from "lucide-react";

// スケジュールデータと謎解きを定義するJSON構造
// plan: 短いタイトル, detail: 詳しい説明 (WIPで追加), riddle: 謎, answer: 答え, hint: ヒント
const scheduleData = {
  Day1: [
    {
      time: "0:00 ~ ",
      plan: "Happy Birthday ほのか！！！",
      detail: "ケーキを食べたり、プレゼントを渡したりするよ！",
      riddle: "た",
      answer: "記憶",
      hint: "ヒント：「た」が手前にあるなら・・・？",
      image: "riddle4.png",
    },
    {
      time: "12:00 ~ ",
      plan: "家を出る",
      detail: "12時くらいに家を出るよ！次の目的地に向かってレッツゴー！",
      riddle: "お花見",
      answer: "ヒル",
      hint: "ヒント：数字は漢字の何かを表しているよ。",
      image: "riddle1.png",
    },
    {
      time: "18:00 ~ ",
      plan: "三井ガーデンホテル豊洲にチェックイン",
      detail: "WIP",
      riddle: "複雑な暗号",
      answer: "CAT",
      hint: "ヒント：一見複雑そうな図形だけど、よく見ると何かが合わさってる・・・！",
      image: "riddle2.png",
    },
    {
      time: "19:00 ~ ",
      plan: "36階のレストランでディナー！",
      detail:
        "三井ガーデンホテルの36階にあるレストランでディナー！コースだから、お腹を空かせておこう！",
      riddle: "紙とカメ",
      answer: "ハニー",
      hint: "ヒント：数字を他の文字で表してみよう！",
      image: "riddle3.png",
    },
    {
      time: "21:00 ~ ",
      plan: "夜景を見ながらお酒を嗜もう！",
      detail: "WIP",
      riddle: "正方形",
      answer: "スクエア",
      hint: "ヒント：4文字のカタカナだよ！",
      image: "riddle9.png",
    },
  ],
  Day2: [
    {
      time: "~ 9:30",
      plan: "ホテルで朝食を食べるよ！",
      detail: "10時半までだから、遅れないように！！",
      riddle: "日本",
      answer: "冒険",
      hint: "ヒント：簡単だから無し！",
      image: "riddle6.png",
    },
    {
      time: "~ 11:00",
      plan: "チェックアウトしよう！",
      detail: "11時までにチェックアウトだから、遅れないように！！！！",
      riddle: "トランプ",
      answer: "クッキー",
      hint: "よく見ると、小さいカードがあるね。",
      image: "riddle7.png",
    },
    {
      time: "13:00 ~ 13:30",
      plan: "チームラボに行くよ！！",
      detail:
        "行ったこと無いって言ってたよね？？俺も行ってみたかったから楽しみ！！",
      riddle: "1つのループ、つまり始点と終点が同じになるようにしよう！",
      answer: "CHAIN",
      hint: "ヒント：このマスの中で作れるアルファベットは限られているよ。",
      image: "riddle8.png",
    },
    {
      time: "16:00 ~ ",
      plan: "オリジナルチョコバナナを食べに行こう！",
      detail: "ほのかが教えてくれたやつ、食べたくて仕方なかった。",
      riddle: "ABC",
      answer: "CUBE",
      hint: "ヒント：A->B->C はアルファベットの順、A->I->U は？",
      image: "riddle5.png",
    },
    {
      time: "16:30 ~ ",
      plan: "原宿近辺で自由時間！",
      detail:
        "ちいかわランド、ゲームセンター、カフェ、などなど！！原宿のちいかわランドがリニューアルしたよ。ゲームセンターでは良いことがあるかも？",
      riddle: "「？」に入る言葉は？",
      answer: "タイマー",
      hint: "ヒント：男の人に注目！",
      image: "riddle10.png",
    },
  ],
};

// アイコンの標準サイズを定義 (Tailwind CSS のクラスを使用)
const ICON_SIZE = "w-6 h-6";
const SMALL_ICON_SIZE = "w-5 h-5";

// 詳細予定モーダルコンポーネント
const DetailModal = ({ isOpen, onClose, scheduleItem }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 border-4 border-pink-400"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-black mb-4 text-pink-600 flex items-center border-b pb-2">
          {/* ここを ICON_SIZE に固定 */}
          <Gift className={`${ICON_SIZE} mr-2 text-pink-500 flex-shrink-0`} />
          {scheduleItem.plan}
        </h3>
        <p className="text-sm text-gray-500 mb-4">時間: {scheduleItem.time}</p>

        <p className="text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
          {scheduleItem.detail}
        </p>
        <button
          onClick={onClose}
          className="w-full mt-6 bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition-all duration-200 shadow-lg"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

// 謎解きモーダルコンポーネント
const RiddleModal = ({
  isOpen,
  onClose,
  scheduleItem,
  onSolveAndOpenDetail,
}) => {
  const [answerInput, setAnswerInput] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // モーダルが開いたときにステートをリセット
  useEffect(() => {
    if (isOpen) {
      setAnswerInput("");
      setMessage("");
      setIsError(false);
    }
  }, [isOpen]);

  // 答えの検証ロジック
  const checkAnswer = () => {
    // 全角・半角、大文字・小文字、スペースを無視して比較
    const normalizedInput = answerInput.toLowerCase().replace(/\s/g, "").trim();
    const normalizedCorrectAnswer = scheduleItem.answer
      .toLowerCase()
      .replace(/\s/g, "")
      .trim();

    if (normalizedInput === normalizedCorrectAnswer) {
      setMessage("🎊正解！！！さすがほのか！！！天才！！！🎊");
      setIsError(false);

      // 成功時は親のコールバックを呼び出し、謎解きモーダルを閉じ、詳細モーダルを開かせる
      setTimeout(() => {
        onSolveAndOpenDetail();
      }, 3000);
    } else {
      setMessage("残念！ヒントをよく見て考えてみてね！");
      setIsError(true);
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100 border-4 border-pink-400"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-pink-600 flex items-center">
          <Lock className={`${ICON_SIZE} mr-2 flex-shrink-0`} />{" "}
          謎解きチャレンジ！
        </h3>

        {scheduleItem.image && (
          <div className="mb-4 rounded-xl overflow-hidden shadow-md">
            <img
              src={`/${scheduleItem.image}`}
              alt="謎解きのヒント画像"
              className="w-full h-auto object-cover border-2 border-pink-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/400x200/F472B6/ffffff?text=Image+Not+Found"; // エラー時のフォールバック
              }}
            />
          </div>
        )}

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
          答えを送信！
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
              <XCircle className={`${SMALL_ICON_SIZE} mr-2 flex-shrink-0`} />
            ) : (
              <CheckCircle
                className={`${SMALL_ICON_SIZE} mr-2 flex-shrink-0`}
              />
            )}
            <span className="font-semibold">{message}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-500 mt-4 hover:text-gray-700 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

// スケジュールテーブル行コンポーネント
const ScheduleRow = ({
  item,
  isRevealed,
  onOpenRiddle,
  onOpenDetail,
  onSolveDirectly,
}) => {
  const pressTimeout = useRef(null); // 長押し用のタイマーを保持

  // 長押し開始 (2000ms後に直接アンロック)
  const handlePressStart = () => {
    // すでにアンロックされている場合は動作させない
    if (isRevealed) return;

    // 2000ms (2秒) に設定
    pressTimeout.current = setTimeout(() => {
      onSolveDirectly(item); // 直接アンロック (謎を解いたことにする)
    }, 2000);
  };

  // 長押し終了/キャンセル
  const handlePressEnd = () => {
    clearTimeout(pressTimeout.current);
    // 長押しを完了したときのみ onSolveDirectly が実行される
  };

  // 通常の行クリック (謎解きモーダルまたは詳細モーダルを開く)
  const handleRowClick = (e) => {
    // 長押し中はクリックイベントも発生するため、長押しでないことを確認するために e.detail を使用
    // PCではクリック回数、スマホでは通常タップ（e.detail=1）を判別する
    if (e.detail === 1) {
      if (isRevealed) {
        onOpenDetail(item); // 詳細モーダルを開く
      } else {
        onOpenRiddle(item); // 謎解きモーダルを開く
      }
    }
  };

  return (
    <div className="flex border-b border-pink-200 last:border-b-0">
      {/* 時間列 (長押しでスキップ) */}
      <div
        className={`w-1/3 p-3 font-semibold flex flex-col items-center justify-center border-r border-pink-200 relative select-none transition-colors ${
          isRevealed
            ? "bg-pink-100 text-pink-700"
            : "bg-pink-100 text-pink-700 cursor-pointer hover:bg-pink-200" // ロック時は少し濃い色でスキップ可能をアピール
        }`}
        // PC/Touchイベントを設定
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseLeave={handlePressEnd} // マウスがエリアを離れた場合もリセット
      >
        <span className="text-lg">{item.time}</span>
        {!isRevealed && (
          <span className="text-[10px] text-red-600 font-bold mt-1 animate-pulse">
            長押しでスキップ！
          </span>
        )}
      </div>

      {/* 予定内容列 (謎解きエリア/詳細表示エリア) */}
      {/* ここで onClick を定義することで、時間列でのクリックと競合しないようにする */}
      <div
        className={`w-2/3 p-3 flex items-center transition-all duration-300 ease-in-out cursor-pointer ${
          isRevealed
            ? "bg-white hover:bg-pink-50" // アンロック済み
            : "bg-pink-300 hover:bg-pink-400 active:bg-pink-500" // ロック中
        }`}
        onClick={handleRowClick}
      >
        {isRevealed ? (
          // 答えが分かっている場合 (タイトル表示 + 詳細モーダルを開く)
          <div className="text-gray-800 font-medium flex items-center">
            <Unlock
              className={`${SMALL_ICON_SIZE} mr-2 text-green-600 flex-shrink-0`}
            />
            <span className="font-extrabold text-md text-pink-800">
              {item.plan}
            </span>
            <span className="text-xs text-gray-500 ml-2">(タップで詳細)</span>
          </div>
        ) : (
          // 謎解きが必要な場合
          <div className="text-white font-bold text-md flex items-center justify-center w-full py-2">
            <Lock className={`${ICON_SIZE} mr-2 flex-shrink-0`} />
            タップして謎解きへ！
          </div>
        )}
      </div>
    </div>
  );
};

// メインアプリケーションコンポーネント
export default function App() {
  // State for the selected day ('Day1' or 'Day2')
  const [selectedDay, setSelectedDay] = useState("Day1");

  // State to track which plans have been revealed (DayN: [index, ...])
  const [revealedPlans, setRevealedPlans] = useState({
    Day1: [],
    Day2: [],
  });

  // Modal states
  const [isRiddleModalOpen, setIsRiddleModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Riddle/Detail Modalで使用する、現在選択されているアイテム
  const [currentRiddleItem, setCurrentRiddleItem] = useState(null); // { day: 'Day1', index: 0, item: {...} }

  // 謎解きモーダルを開く処理
  const handleOpenRiddle = (item) => {
    // 現在選択されているDayとIndexを設定
    const index = scheduleData[selectedDay].findIndex(
      (i) => i.time === item.time && i.plan === item.plan
    );
    setCurrentRiddleItem({ day: selectedDay, index: index, item: item });
    setIsRiddleModalOpen(true);
  };

  // 詳細モーダルを開く処理 (アンロック済み行クリック用)
  const handleOpenDetail = (item) => {
    setCurrentRiddleItem({ item: item });
    setIsDetailModalOpen(true);
  };

  // 謎解きが解けた時の処理 (RiddleModalから呼ばれる)
  const handleSolveAndOpenDetail = useCallback(() => {
    if (currentRiddleItem) {
      // 1. アンロック状態を更新
      setRevealedPlans((prev) => ({
        ...prev,
        [currentRiddleItem.day]: [
          ...prev[currentRiddleItem.day],
          currentRiddleItem.index,
        ],
      }));

      // 2. 謎解きモーダルを閉じる
      setIsRiddleModalOpen(false);

      // 3. 詳細モーダルを開く
      setIsDetailModalOpen(true);
    }
  }, [currentRiddleItem]);

  // 長押しで直接アンロックする処理 (自動で詳細モーダルを開かない)
  const handleSolveDirectly = useCallback(
    (itemToSolve) => {
      const index = scheduleData[selectedDay].findIndex(
        (i) => i.time === itemToSolve.time && i.plan === itemToSolve.plan
      );

      if (index !== -1 && !revealedPlans[selectedDay].includes(index)) {
        // 1. アンロック状態を更新
        setRevealedPlans((prev) => ({
          ...prev,
          [selectedDay]: [...prev[selectedDay], index],
        }));

        // 2. 詳細モーダルは開かない（ユーザーがタップするのを待つ）
      }
    },
    [selectedDay, revealedPlans]
  );

  const schedule = scheduleData[selectedDay];

  // Dayごとの概要情報
  const daySummaries = {
    Day1: "1日目はゆったり、大人な雰囲気！ちょっとオシャレなところに行くから、服装はカジュアルすぎないように注意！",
    Day2: "2日目は色んなところにお出かけ！出来るだけ歩きやすい靴を履いて、短いスカートは避けた方が良いよ！",
  };

  return (
    <div className="min-h-screen bg-pink-50 font-sans p-4 flex flex-col items-center">
      <script src="https://cdn.tailwindcss.com"></script>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />

      {/* ★ デコレーション用カスタムスタイル */}
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .schedule-container {
            width: 100%;
            max-width: 600px;
        }
        .animate-sparkle {
            animation: sparkle 1.5s ease-in-out infinite alternate;
        }
        @keyframes sparkle {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      <meta name="robots" content="noindex" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* ヘッダー */}
      <header className="w-full max-w-md text-center py-6">
        <h1 className="text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500 animate-sparkle">
          💖 Happy Birthday! 💖
        </h1>
        <p className="text-lg text-gray-700 font-bold mt-4">
          2日間のスケジュールを知りたい？？
          <br />
          謎が解けたら教えてあげる！
        </p>
      </header>

      {/* デイ切り替えボタン */}
      <div className="w-full max-w-sm flex justify-center space-x-4 mb-6 p-1 bg-white rounded-xl shadow-xl">
        <button
          onClick={() => setSelectedDay("Day1")}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 text-lg w-1/2 ${
            selectedDay === "Day1"
              ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg transform scale-105"
              : "bg-white text-pink-500 hover:bg-pink-100"
          }`}
        >
          Day 1
        </button>
        <button
          onClick={() => setSelectedDay("Day2")}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 text-lg w-1/2 ${
            selectedDay === "Day2"
              ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg transform scale-105"
              : "bg-white text-pink-500 hover:bg-pink-100"
          }`}
        >
          Day 2
        </button>
      </div>

      {/* 注意事項/ざっくり情報エリア (bg-whiteは残しつつ、縁を削除) */}
      <div className="w-full max-w-md bg-white p-4 mb-6 rounded-2xl shadow-inner border border-pink-100">
        <h2 className="text-xl font-extrabold text-pink-700 flex items-center mb-2">
          <Info className="w-5 h-5 mr-2 flex-shrink-0 text-pink-500" />
          {selectedDay} の 概要と注意点！
        </h2>
        <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">
          {daySummaries[selectedDay]}
        </p>
        <p className="text-xs text-gray-500 mt-3 font-medium border-t pt-4">
          💡 テストテストテストテストテストテスト
        </p>
      </div>

      {/* スケジュール表示エリア */}
      <main className="schedule-container bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-300">
        {/* テーブルヘッダー */}
        <div className="flex bg-gradient-to-r from-pink-600 to-red-500 text-white font-extrabold text-lg">
          <div className="w-1/3 p-4 text-center">時間</div>
          <div className="w-2/3 p-4 text-center border-l border-pink-400">
            ドキドキ予定内容
          </div>
        </div>

        {/* スケジュールリスト */}
        <div className="divide-y divide-pink-200">
          {schedule.map((item, index) => (
            <ScheduleRow
              key={index}
              item={item}
              isRevealed={revealedPlans[selectedDay].includes(index)}
              onOpenRiddle={() => handleOpenRiddle(item)} // ロック時
              onOpenDetail={handleOpenDetail} // アンロック時
              onSolveDirectly={handleSolveDirectly} // 長押し処理
            />
          ))}
        </div>
      </main>

      {/* 謎解きモーダル */}
      <RiddleModal
        isOpen={isRiddleModalOpen}
        onClose={() => setIsRiddleModalOpen(false)}
        scheduleItem={currentRiddleItem?.item || {}}
        onSolveAndOpenDetail={handleSolveAndOpenDetail}
      />

      {/* 詳細予定モーダル */}
      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        scheduleItem={currentRiddleItem?.item || {}}
      />
    </div>
  );
}
