import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'weeklyProgram',
  title: 'Weekly Program',
  type: 'document',
  icon: () => '📅',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'Clerk user ID of the user who created the program.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Program Name',
      description: 'Name of this weekly program (e.g., "Push/Pull/Legs").',
      type: 'string',
      initialValue: 'My Weekly Program',
    }),
    defineField({
      name: 'isActive',
      title: 'Active Program',
      description: 'Whether this is the currently active program.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'days',
      title: 'Weekly Schedule',
      description: 'Workout plan for each day of the week.',
      type: 'array',
      validation: (Rule) => Rule.max(7),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'dayPlan',
          title: 'Day Plan',
          fields: [
            defineField({
              name: 'dayOfWeek',
              title: 'Day of Week',
              type: 'string',
              options: {
                list: [
                  {title: 'Monday', value: 'monday'},
                  {title: 'Tuesday', value: 'tuesday'},
                  {title: 'Wednesday', value: 'wednesday'},
                  {title: 'Thursday', value: 'thursday'},
                  {title: 'Friday', value: 'friday'},
                  {title: 'Saturday', value: 'saturday'},
                  {title: 'Sunday', value: 'sunday'},
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'isRestDay',
              title: 'Rest Day',
              description: 'Mark this day as a rest day.',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'workoutName',
              title: 'Workout Name',
              description: 'Name for this day\'s workout (e.g., "Push Day", "Leg Day").',
              type: 'string',
            }),
            defineField({
              name: 'exercises',
              title: 'Planned Exercises',
              description: 'Exercises planned for this day.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'plannedExercise',
                  title: 'Planned Exercise',
                  fields: [
                    defineField({
                      name: 'exerciseRef',
                      title: 'Exercise',
                      description: 'Reference to the exercise.',
                      type: 'reference',
                      to: [{type: 'exercise'}],
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'plannedSets',
                      title: 'Planned Sets',
                      type: 'number',
                      initialValue: 3,
                      validation: (Rule) => Rule.min(1).max(20),
                    }),
                    defineField({
                      name: 'plannedReps',
                      title: 'Planned Reps',
                      type: 'number',
                      initialValue: 10,
                      validation: (Rule) => Rule.min(1).max(100),
                    }),
                    defineField({
                      name: 'notes',
                      title: 'Notes',
                      type: 'string',
                    }),
                  ],
                  preview: {
                    select: {
                      exerciseName: 'exerciseRef.name',
                      sets: 'plannedSets',
                      reps: 'plannedReps',
                    },
                    prepare({exerciseName, sets, reps}) {
                      return {
                        title: exerciseName || 'Select exercise',
                        subtitle: `${sets || 3} sets × ${reps || 10} reps`,
                      }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              day: 'dayOfWeek',
              workoutName: 'workoutName',
              isRestDay: 'isRestDay',
              exercises: 'exercises',
            },
            prepare({day, workoutName, isRestDay, exercises}) {
              const exerciseCount = exercises ? exercises.length : 0
              const title = day ? day.charAt(0).toUpperCase() + day.slice(1) : 'Day'
              const subtitle = isRestDay 
                ? '🛌 Rest Day' 
                : workoutName 
                  ? `${workoutName} (${exerciseCount} exercises)`
                  : `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`
              return {title, subtitle}
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      name: 'name',
      isActive: 'isActive',
      days: 'days',
    },
    prepare({name, isActive, days}) {
      const dayCount = days ? days.length : 0
      return {
        title: name || 'Weekly Program',
        subtitle: `${isActive ? '✅ Active' : '⏸️ Inactive'} | ${dayCount} days planned`,
      }
    },
  },
})
