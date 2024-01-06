import { faker } from '@faker-js/faker';

interface ExplorePost {
    user: string,
    description: string,
    location: any,
    img: any,
    video: any,
    likes: number,
    comment: number,
    created_at: string,
    modified_at: string,
}

export default function generatePosts() {
    const posts: ExplorePost[] = [];
    for (let i = 0; i < 18; i++) {
        const post: ExplorePost = {
            user: `user-${faker.string.numeric({ length: 6 })}`,
            description: faker.lorem.sentence(),
            location: faker.location.country(),
            img: faker.image.avatar(),
            video: faker.image.avatar(),
            likes: faker.number.int({ max: 10000 }),
            comment: faker.number.int({ max: 10000 }),
            created_at: faker.date.past().toISOString(),
            modified_at: faker.date.past().toISOString(),
        }
        posts.push(post)
    }
    return posts;
}