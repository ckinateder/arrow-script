from bs4 import BeautifulSoup
import re
from tqdm import tqdm

# Importing the HTTP library
import requests as req


# Requesting for the website
def get_transcript(url):
    html_doc = req.get(url)

    try:
        if html_doc:
            # Creating a BeautifulSoup object and specifying the parser
            S = BeautifulSoup(html_doc.content, "html.parser")

            # Using the prettify method
            # print(S.prettify())

            # title is in h2 class topic-title
            title = S.find("h2", class_="topic-title").get_text()
            print(title)

            # find class="content" and get the text
            content = S.find("div", class_="content")
            full_text = content.get_text()
            # print(full_text)
            # print("-----")
            # print(content.get_text())
            # each line is <strong> character name </strong> dialogue <br/>
            # make a list of tuples (character, dialogue)
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
                    tqdm.write(f"{tup}")
            return title, lines
        raise Exception("No content found")
    except Exception as e:
        print(e)
        return None, []


if __name__ == "__main__":
    # t goes up by 1 for each episode
    url = "https://transcripts.foreverdreaming.org/viewtopic.php?t=10204"

    title, lines = get_transcript(url)
