import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_COMMENT } from "../../utils/mutations";
import { QUERY_COMMENTS, QUERY_ME } from "../../utils/queries";

const CommentForm = () => {
  const [commentText, setText] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [addComment, { error }] = useMutation(ADD_COMMENT, {
    update(cache, { data: { addComment } }) {
      try {
        // could potentially not exist yet, so wrap in a try...catch
        const { comments } = cache.readQuery({ query: QUERY_COMMENTS });
        cache.writeQuery({
          query: QUERY_COMMENTS,
          data: { comments: [addComment, ...comments] },
        });
      } catch (e) {
        console.error(e);
      }

      // update me object's cache, appending new comment to the end of the array
      const { me } = cache.readQuery({ query: QUERY_ME });
      cache.writeQuery({
        query: QUERY_ME,
        data: { me: { ...me, comments: [...me.comments, addComment] } },
      });
    },
  });
  const handleChange = (event) => {
    if (event.target.value.length <= 140) {
      setText(event.target.value);
      setCharacterCount(event.target.value.length);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      // add comment to database
      await addComment({
        variables: { commentText },
      });

      // clear form value
      setText("");
      setCharacterCount(0);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div>
      <p
        className={`failed-signup-style ${
          characterCount === 140 ? "text-error" : ""
        }`}
      >
        Character Count: {characterCount}/140
        {error && <span className="ml-2">Something went wront...</span>}
      </p>{" "}
      <form
        className="flex-row justify-center justify-space-between-md align-stretch"
        onSubmit={handleFormSubmit}
      >
        <textarea
          placeholder="Here's a new comment..."
          value={commentText}
          className="form-input comment-submit-text"
          onChange={handleChange}
        ></textarea>
        <button className="login-submit-button" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CommentForm;
