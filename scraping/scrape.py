from bs4 import BeautifulSoup
import re
from tqdm import tqdm
from typing import Union, List, Tuple, Dict
from urllib.request import urljoin
from time import sleep
import json

# Importing the HTTP library
import requests as req

BLACKLIST = [
    "https://transcripts.foreverdreaming.org/viewtopic.php?t=10291&sid=dddf1c741ac939a0c6a6f3a82db2e723",
    "https://transcripts.foreverdreaming.org/viewtopic.php?t=32146&sid=dddf1c741ac939a0c6a6f3a82db2e723",
    "https://transcripts.foreverdreaming.org/viewtopic.php?t=144106&sid=dddf1c741ac939a0c6a6f3a82db2e723",
    "https://transcripts.foreverdreaming.org/viewtopic.php?t=10291&sid=78a5237c9aabdeb01274481c9cecd8b4",
    "Arrow Transcript Index",
    "VIP Member 2024 This is your year!",
    "Updates: (03/01/24) Secrets of the Board",
]


# Requesting for the website
def get_transcript(url: str) -> Union[str, list]:
    """Get the transcript from a given URL.
      The URL should be a post from foreverdreaming.org

    Args:
        url (str): valid URL from foreverdreaming.org

    Raises:
        Exception: Thrown if no content is found, if the URL is invalid, or if the request fails

    Returns:
        Union[str, list]: title of the transcript, list of tuples containing character and dialogue
    """

    html_doc = req.get(url)

    try:
        if html_doc:
            # Creating a BeautifulSoup object and specifying the parser
            S = BeautifulSoup(html_doc.content, "html.parser")

            # title is in h2 class topic-title
            title = S.find("h2", class_="topic-title").get_text()

            # find class="content" and get the text
            content = S.find("div", class_="content")
            full_text = content.get_text()

            lines = []
            for line in tqdm(content.find_all("strong"), leave=False, ncols=100):
                character = line.get_text()
                # select everything UNTIL next <strong> tag. there may be multiple <br> or <em> tags
                next_tag = line.find_next("strong")
                traverse = line.next_sibling
                dialogue = ""
                while traverse != next_tag:
                    if traverse:
                        dialogue += traverse.get_text()
                        traverse = traverse.next_sibling
                    else:
                        break
                # remove any extra whitespace
                dialogue = re.sub(r"\s+", " ", dialogue)

                # remove anything in brackets or parentheses
                dialogue = re.sub(r"\[.*\]", "", dialogue)
                dialogue = re.sub(r"\(.*\)", "", dialogue)

                # remove any leading or trailing whitespace
                dialogue = dialogue.strip()

                # remove colon
                if dialogue and dialogue[0] == ":":
                    dialogue = dialogue[2:]

                tup = (character, dialogue)
                if tup[1] != "":
                    lines.append(tup)
                    # tqdm.write(f"{tup}")
            return title, lines
        raise Exception("No content found")
    except Exception as e:
        print(e)
        return None, []


# TODO: get a list of transcript URLs from a show page
# link is in div class="list-inner" and an <a> tag
# <a> tag has href attribute


def get_transcript_links(url: str) -> List[Tuple[str, str]]:
    """Get a list of transcript URLs from a show page.

    Args:
        url (str): valid URL from foreverdreaming.org

    Raises:
        Exception: Thrown if no content is found, if the URL is invalid, or if the request fails

    Returns:
        list: list of tuples containing title and URL of the transcript
    """

    html_doc = req.get(url)

    try:
        if html_doc:
            # Creating a BeautifulSoup object and specifying the parser
            S = BeautifulSoup(html_doc.content, "html.parser")

            # find class="list-inner
            content = S.findAll("a", class_="topictitle")
            links = []
            for link in content:
                l = link["href"]
                t = link.get_text()
                if not l.startswith("http"):
                    l = urljoin(url, l)
                if l not in BLACKLIST and t not in BLACKLIST:
                    links.append((t, l))
            return links

        raise Exception("No content found")
    except Exception as e:
        print(e)
        return []


def get_all_transcripts(
    episodes: List[Tuple[str, str]], timeout: float = 0.5
) -> List[Dict[str, List[Tuple[str, str]]]]:
    """Given a list of episode URLs, get all transcripts from the URLs.
    This function will call get_transcript for each episode URL.

    Args:
        episodes (List[Tuple[str, str]]): _description_
        timeout (float, optional): _description_. Defaults to 0.5.

    Returns:
        List[Dict[str, List[Tuple[str, str]]]]: _description_
    """
    transcripts = []
    pbar = tqdm(total=len(episodes), ncols=100, unit="ep")
    for i in range(len(episodes)):
        episode = episodes[i]
        title, lines = get_transcript(episode[1])
        pbar.set_description(f"{episode[0]}")
        if title:
            transcripts.append({"title": title, "link": episode[1], "lines": lines})
        pbar.update(1)
        sleep(timeout)
    pbar.close()
    # sort by title
    transcripts = sorted(transcripts, key=lambda x: x["title"])
    return transcripts


if __name__ == "__main__":
    url = "https://transcripts.foreverdreaming.org/viewtopic.php?t=10204"

    episode_listing = [
        "https://transcripts.foreverdreaming.org/viewforum.php?f=172",
        "https://transcripts.foreverdreaming.org/viewforum.php?f=172&start=78",
        "https://transcripts.foreverdreaming.org/viewforum.php?f=172&start=172",
    ]

    title, lines = get_transcript(url)
    episodes = []
    for episode in episode_listing:
        episodes.extend(get_transcript_links(episode))

    transcripts = get_all_transcripts(episodes)

    # dump json
    with open("transcripts.json", "w+") as f:
        json.dump(transcripts, f, indent=4)
