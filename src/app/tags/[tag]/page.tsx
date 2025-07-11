import { getAllTags, getPostsByTag, getTag } from '@/lib/content';
import PostCard from '@/components/PostCard';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils';
import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/lib/site';

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({
    tag: slugify(tag.title),
  }));
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const { tag } = await params;
  const tagData = getTag(tag);
  const tagName = tagData?.title || tag.charAt(0).toUpperCase() + tag.slice(1);
  const description = tagData?.meta_description || tagData?.description || `Posts tagged with "${tagName}".`;

  const baseUrl = siteConfig.url;
  const pageUrl = `${baseUrl}/tags/${tag}`;

  return {
    title: tagData?.meta_title || tagName,
    description: description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: tagData?.meta_title || tagName,
      description: description,
      url: pageUrl,
    }
  };
}


export default async function TagPage({ params }: { params: { tag: string } }) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  const tagData = getTag(tag);
  const tagName = tagData?.title || tag.charAt(0).toUpperCase() + tag.slice(1);
  const tagDescription = tagData?.description;

  if (posts.length === 0 && !tagData) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">Tag: {tagName}</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          {tagDescription || `Posts tagged with "${tagName}".`}
        </p>
      </div>
       {posts.length > 0 ? (
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
         <p className="text-center text-muted-foreground">No posts found with this tag yet.</p>
      )}
      {tagData?.content && (
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="prose dark:prose-invert max-w-none text-lg">
            <p className="whitespace-pre-wrap font-body leading-relaxed">{tagData.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
