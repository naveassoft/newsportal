import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

  async function deleteComment(id) {
    try {
      const confirm = window.confirm("Are you sure to delete?");
      if (!confirm) return;
      const res = await fetch("/api/news/dashboard", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ id, user_id: store.user.id }),
      });
      const result = await res.json();
      if (res.ok) {
        store.setAlert({ msg: result.message, type: "success" });
        setUpdate((prev) => !prev);
      } else throw result;
    } catch (error) {
      store.setAlert({ msg: error.message, type: "error" });
    }
  }

  return (
    <section className="my-10 print:hidden">
      <form
        className="bg-slate-200 rounded shadow py-3 px-3"
        onSubmit={(e) => handleSubmit(e)}
      >
        <textarea
          ref={textArea}
          required
          className="w-full p-5 rounded outline-none resize-none"
          cols="30"
          rows="3"
          placeholder="Your comment*..."
        />
        <div className="flex justify-center mt-5">
          <button disabled={loading} className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
      {comments.length ? (
        <div className="my-5 space-y-3">
          <h4 className="font-bold text-xl">All comments:</h4>
          {comments.map((item, i) => (
            <div className="comment-item" key={i}>
              <div>
                <p className="font-medium">{item.user_name}</p>
                <p className="text-justify">{item.comment}</p>
              </div>
              {store?.user?.id === item.user_id ? (
                <div>
                  <button onClick={() => deleteComment(item.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Comment;
