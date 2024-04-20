import pandas as pd


# load the data and only keep the columns we need
def parse_columns(
    path: str = "transcripts.csv",
    keep: list = [
        "character",
        "charactername",
        "charactertype",
        "gender",
        "title",
        "lines",
        "season",
        "episode",
    ],
) -> pd.DataFrame:
    """Load a csv file and keep only the columns we need

    Args:
        path (str, optional): input path. Defaults to "transcripts.csv".
        keep (list, optional): to keep. Defaults to [ "character", "charactername", "charactertype", "gender", "title", "lines", ].

    Returns:
        pd.DataFrame: cleaned
    """
    df = pd.read_csv(path)
    df = df[keep]
    return df


if __name__ == "__main__":
    df = parse_columns()
    print(df.head())
    print(df.info())
    print(df.describe())
    df.to_csv("small.csv", index=False)
