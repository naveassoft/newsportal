import React, { useRef, useState } from "react";
import useStore from "../context/useStore";

const Comment = ({ newsId, setUpdate, comments }) => {
  const [loading, setLoading] = useState(false);
  const textArea = useRef(null);
  const store = useStore();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!store?.user) {
      store?.setAlert({ msg: "Please login first" });
      store?.setShowLoginRegister(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/news/dashboard", {
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          user_id: store?.user.id,
          news_id: newsId,
          comment: textArea.current?.value,
          user_name: store?.user.name,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        store?.setAlert({ msg: result.message, type: "success" });
        textArea.current.value = "";
        setUpdate((prev) => !prev);
      } else throw result;
    } catch (error) {
      store?.setAlert({ msg: error.message, type: "error" });
    }
    setLoading(false);
  }

  return (
    <section className='my-10 print:hidden'>
      <form
        className='bg-slate-200 rounded shadow py-3 px-3'
        onSubmit={(e) => handleSubmit(e)}
      >
        <textarea
          ref={textArea}
          required
          className='w-full p-5 rounded outline-none resize-none'
          cols='30'
          rows='3'
          placeholder='Your comment*...'
        />
        <div className='flex justify-center mt-5'>
          <button disabled={loading} className='btn btn-primary'>
            Submit
          </button>
        </div>
      </form>
      {comments.length ? (
        <div className='my-5 space-y-3'>
          <h4 className='font-bold text-xl'>All comments:</h4>
          {comments.map((item, i) => (
            <div className='mb-5 border-b rounded pb-3' key={i}>
              <p className='font-medium'>{item.user_name}</p>
              <p className='text-justify'>{item.comment}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Comment;
