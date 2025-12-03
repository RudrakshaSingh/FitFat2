import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  icon: () => '🏋️‍♂️',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Clerk user ID for ownership',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'name',
      title: 'Exercise Name',
      description: 'Name of the exercise will be displayed in the workout plan.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Detailed description of the exercise.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      description: 'Difficulty level of the exercise to help users choose appropriate exercises.',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Exercise Image',
      type: 'image',
      description: 'An image representing the exercise.',
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Alternative text for the image.',
        },
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'A URL to a video demonstrating the exercise.',
      type: 'url',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle to show or hide this exercise in the app.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'difficulty',
      media: 'image',
    },
  },
})
