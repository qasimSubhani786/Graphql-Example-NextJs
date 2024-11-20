import Head from "next/head";
import { AwesomeLink } from "../components/AwesomeLink";
import { useQuery, gql } from "@apollo/client";
import { useState } from "react";

export interface Link {
  cursor: String;
  node: {
    imageUrl: string;
    url: string;
    title: string;
    category: string;
    description: string;
  };
}

interface AllLinksQueryResult {
  getAllLinks: {
    edges: Link[];
    pageInfo: {
      hasNextPage: Boolean;
      endCursor: String;
    };
  };
}

const allLinksQuery = gql`
  query ExampleQuery($first: Int, $after: String) {
    getAllLinks(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          url
          title
          imageUrl
          id
          description
          category
        }
        cursor
      }
    }
  }
`;

export default function Home() {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, loading, error, fetchMore } = useQuery<AllLinksQueryResult>(
    allLinksQuery,
    {
      variables: {
        first: 2,
      },
    }
  );

  if (loading) {
    return <p className=" flex items-center justify-center">Loading...</p>;
  }

  if (error) {
    return <p>Something went wrong...</p>;
  }
  const hasNextPage = data?.getAllLinks.pageInfo.hasNextPage;
  const endCursor = data?.getAllLinks.pageInfo.endCursor;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          after: endCursor,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          fetchMoreResult.getAllLinks.edges = [
            ...prevResult.getAllLinks.edges,
            ...fetchMoreResult.getAllLinks.edges,
          ];
          return fetchMoreResult;
        },
      });
    } catch (error) {
      console.error("Error fetching more records:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  return (
    <div>
      <Head>
        <title>Awesome Links</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto max-w-5xl my-20">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.getAllLinks.edges.map((link, index) => (
            <AwesomeLink
              imageUrl={link?.node.imageUrl}
              url={link.node?.url}
              title={link?.node.title}
              category={link?.node.category}
              description={link?.node.description}
              id={index}
            />
          ))}
        </ul>
      </div>
      {hasNextPage ? (
        <div className="flex flex-1 items-center justify-center">
          <button
            className=" bg-slate-500 rounded-lg p-6 text-white "
            onClick={handleLoadMore}
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center mb-7">
          <p className="">You reached at the end!</p>
        </div>
      )}
    </div>
  );
}
