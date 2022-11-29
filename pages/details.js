/* eslint-disable @next/next/no-img-element */
import { faEdit, faLink, faPrint } from "@fortawesome/free-solid-svg-icons";
import { faClock, faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import TopPart from "../components/common/TopPart";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from "react-share";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/router";
import LergeAdd from "../components/common/advertizer/LergeAdd";
import TopMenus from "../components/common/TopMenus";
import Link from "next/link";
import CategoryDetailsSideBar from "../components/common/CategoryDetailsSideBar";
import Breakingnews from "../components/common/BreakingNews";
import useStore from "../components/context/useStore";
import Comment from "../components/details/Comment";
import { Markup } from "interweave";

const Details = () => {
  const [relatedNews, setRelatedNews] = useState(null);
  const { setError, siteInfo, ipAdress } = useStore();
  const [linkCopy, setLinkCopied] = useState(false);
  const [update, setUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState(null);
  const [ads, setAds] = useState(null);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const store = useStore();

  function handleCopyLink() {
    setLinkCopied(true);
    navigator.clipboard.writeText("/" + router.asPath);
  }

  async function getSingeNews(signal) {
    store.setLoading(true);
    try {
      const res = await fetch(`/api/news?id=${router.query?.id}`, {
        signal,
      });
      const result = await res.json();
      if (res.ok) {
        setNews(result);
        //get related news;
        await getRelatedNews(result.category_name);
      } else throw result;
    } catch (error) {
      store.setAlert({ msg: error.message, type: "error" });
      setError(true);
    }
    store.setLoading(false);
  }

  async function updateViewPost(ipAdress) {
    try {
      const res = await fetch(`/api/news/dashboard?news=true`, {
        headers: {
          "content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ ipAdress, news_id: router.query.id }),
      });
      const result = await res.json();
      if (!res.ok) throw result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async function getRelatedNews(category) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/news/home?category=${category}&limit=9&page=${page}`
      );
      const result = await res.json();
      if (res.ok) {
        setRelatedNews(result);
      } else throw result;
    } catch (error) {
      throw error;
    }
    setLoading(false);
  }
  function saveNewsHistory() {
    try {
      const history = localStorage.getItem("history");
      if (history) {
        let news = JSON.parse(history);
        const isExist = news.find((id) => id === router.query.id);
        if (!isExist) {
          news.push(router.query.id);
          news =
            news.length > 20 ? news.slice(news.length - 20, news.length) : news;
          localStorage.setItem("history", JSON.stringify(news));
        }
      } else {
        localStorage.setItem("history", JSON.stringify([router.query.id]));
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    //get the news;
    if (router.query.id) {
      (async () => {
        await getSingeNews(signal);
        //update news views;
        if (ipAdress) {
          await updateViewPost(ipAdress);
        }

        saveNewsHistory();
      })();
    }
    return () => {
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id, ipAdress, update]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async function () {
      try {
        const res = await fetch("/api/settings/ads", {
          signal,
        });
        const result = await res.json();
        if (res.ok) {
          setAds(result.other);
        } else throw result;
      } catch (error) {
        console.log(error.message);
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  if (!news) return null;
  return (
    <div className='mb-10'>
      <TopPart page='details' />
      <TopMenus />
      <Breakingnews />

      {ads && (
        <LergeAdd
          picture={`/ads/${ads?.long[0].image || ""}`}
          link={ads?.long[0].link}
        />
      )}

      <section className='details-page-content-wrapper'>
        <section className='col-span-3 md:col-span-2 print:col-span-3'>
          <section className='news-details-wrapper'>
            {/* top part */}
            <div className='top-part'>
              <p className='space-x-1'>
                <FontAwesomeIcon icon={faClock} />
                <span>18 October, 2022 12:02</span>
              </p>
              <div className='space-x-5'>
                <button onClick={handleCopyLink}>
                  <FontAwesomeIcon icon={faLink} />
                  <span>{linkCopy ? "Copied!" : "Copy Link"}</span>
                </button>
                <button onClick={() => window.print()}>
                  <FontAwesomeIcon icon={faPrint} />
                  <span>Print</span>
                </button>

                <FacebookShareButton url={"https://navieasoft.com/"}>
                  <p className='share'>
                    <FontAwesomeIcon icon={faFacebook} />
                    <span>Share</span>
                  </p>
                </FacebookShareButton>
              </div>
            </div>

            {/* news details */}
            <div className='news-details'>
              <h3>{news.headline}</h3>
              <p className='text-lg my-5 space-x-2'>
                <FontAwesomeIcon className='text-gray-600' icon={faEdit} />
                <span>Online Reporter</span>
              </p>
              <img
                className='object-contain'
                src={`/assets/${news.image}`}
                alt='news image'
              />

              <Markup
                content={news.body}
                className='text-justify mt-10 text-xl'
              />

              <p className='mt-10 text-xl'>
                {siteInfo?.name}/{news.editor_name}
              </p>

              <div className='social-icons'>
                <TwitterShareButton url={"https://navieasoft.com/"}>
                  <a className='text-blue-400'>
                    <FontAwesomeIcon icon={faTwitter} />
                  </a>
                </TwitterShareButton>
                <LinkedinShareButton url={"https://navieasoft.com/"}>
                  <a className='text-[#0e76a8]'>
                    <FontAwesomeIcon icon={faLinkedin} />
                  </a>
                </LinkedinShareButton>
                <FacebookShareButton url={"https://navieasoft.com/"}>
                  <a className='text-blue-600'>
                    <FontAwesomeIcon icon={faFacebook} />
                  </a>
                </FacebookShareButton>
                <EmailShareButton
                  subject='This the subject of the email'
                  url={"https://navieasoft.com/"}
                >
                  <a>
                    <FontAwesomeIcon icon={faEnvelope} />
                  </a>
                </EmailShareButton>
              </div>
            </div>
          </section>

          {/* comment section */}
          <Comment
            newsId={news?.id}
            setUpdate={setUpdate}
            comments={news.comments || null}
          />

          <section>
            {ads && (
              <LergeAdd
                picture={`/ads/${ads?.long[1].image || ""}`}
                link={ads?.long[1].link}
              />
            )}

            {/* Realated news */}
            <section className='print:hidden'>
              <b className='mb-4 block'>Related News:</b>
              <div className='related-news-wrapper'>
                {relatedNews && relatedNews.length ? (
                  relatedNews.map((news) => (
                    <Link
                      href={`/details?category=${news.category}&id=${news.id}`}
                      key={news.id}
                    >
                      <a className='news'>
                        <img
                          className='object-cover object-center rounded-t'
                          src={`/assets/${news.image}`}
                          alt=''
                        />
                        <p className='font-medium px-2 pb-3'>{news.headline}</p>
                      </a>
                    </Link>
                  ))
                ) : (
                  <div>
                    <p className='font-medium text-gray-600 mt-5 text-center'>
                      No data
                    </p>
                  </div>
                )}
              </div>
              <div className='flex justify-end mt-5'>
                <button
                  disabled={loading}
                  onClick={() => {
                    setPage((prev) => prev + 1);
                    getRelatedNews(news.category_name);
                  }}
                  className='btn btn-primary'
                >
                  Load More
                </button>
              </div>
            </section>
            {ads && (
              <LergeAdd
                picture={`/ads/${ads?.long[2].image || ""}`}
                link={ads?.long[2].link}
              />
            )}
          </section>
        </section>

        {/* side bar */}
        <CategoryDetailsSideBar page={"details"} />
      </section>
    </div>
  );
};

export default Details;
