import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  icon: () => '💪',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'Clerk user ID of the user who created the workout.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Workout Date',
      description: 'Date when the workout was performed.',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (in seconds)',
      description: 'Total duration of the workout in seconds.',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'exercises',
      title: 'Workout Exercises',
      description:
        'List of exercises included in the workout with number of sets, repetitions and weight.',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workoutExercise',
          title: 'Workout Exercise',
          fields: [
            defineField({
              name: 'exerciseRef',
              title: 'Exercise',
              description: 'Reference to the exercise performed.',
              type: 'reference',
              to: [{type: 'exercise'}],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description: 'List of sets performed for this exercise.',
              type: 'array',
              validation: (Rule) => Rule.required().min(1),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'exerciseSet',
                  title: 'Exercise Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Repetitions',
                      description: 'Number of repetitions in this exercise set.',
                      type: 'number',
                      validation: (Rule) => Rule.required().min(0),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      description: 'Weight used in this exercise set.',
                      type: 'number',
                      validation: (Rule) => Rule.min(0),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      description: 'Unit of measurement for the weight.',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Kilograms', value: 'kg'},
                          {title: 'Pounds', value: 'lbs'},
                        ],
                        layout: 'radio',
                      },
                      initialValue: 'kg',
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit',
                    },
                    prepare({reps, weight, weightUnit}) {
                      return {
                        title: `Set: ${reps || 0} reps`,
                        subtitle: weight ? `${weight} ${weightUnit || 'kg'}` : 'Body weight',
                      }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              exerciseName: 'exerciseRef.name',
              sets: 'sets',
            },
            prepare({exerciseName, sets}) {
              const setCount = sets ? sets.length : 0
              return {
                title: exerciseName || 'Select an exercise',
                subtitle: `${setCount} set${setCount !== 1 ? 's' : ''}`,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
    },
    prepare({date, duration, exercises}) {
      const workoutDate = date ? new Date(date).toLocaleDateString() : 'No date found'
      const durationMinutes = duration ? Math.floor(duration / 60) : 0
      const exerciseCount = exercises ? exercises.length : 0
      return {
        title: `Workout on ${workoutDate}`,
        subtitle: `Duration: ${durationMinutes} min | ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`,
      }
    },
  },
})
