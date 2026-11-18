const College = require("../models/admission/selector/College");
const Course = require("../models/admission/selector/Course");
const Stream = require("../models/examination/selector/Stream");

// @desc Seed sample data for Campus, Course, and Stream
// @route POST /api/seed-data
exports.seedSampleData = async (req, res) => {
  try {
    console.log('Starting data seeding...');

    // 1. Create Campuses (Colleges)
    const campuses = await College.insertMany([
      {
        code: 'AKNU-RAJ',
        name: 'AKNU Rajamahendravaram Campus',
        city: 'Rajamahendravaram',
        status: 'Active',
      },
      {
        code: 'AKNU-KKD',
        name: 'AKNU Kakinada Campus',
        city: 'Kakinada',
        status: 'Active',
      },
      {
        code: 'AKNU-VZG',
        name: 'AKNU Vizianagaram Campus',
        city: 'Vizianagaram',
        status: 'Active',
      },
    ]);
    console.log(`✅ Created ${campuses.length} campuses`);

    // 2. Create Courses with campusId references
    const courses = await Course.insertMany([
      // Rajamahendravaram Campus Courses
      {
        code: 'BTECH',
        name: 'Bachelor of Technology',
        campusId: campuses[0]._id,
        duration: 4,
        status: 'Active',
        comments: 'Engineering degree program',
      },
      {
        code: 'BSC',
        name: 'Bachelor of Science',
        campusId: campuses[0]._id,
        duration: 3,
        status: 'Active',
        comments: 'Science degree program',
      },
      {
        code: 'BCOM',
        name: 'Bachelor of Commerce',
        campusId: campuses[0]._id,
        duration: 3,
        status: 'Active',
        comments: 'Commerce degree program',
      },
      
      // Kakinada Campus Courses
      {
        code: 'MBA',
        name: 'Master of Business Administration',
        campusId: campuses[1]._id,
        duration: 2,
        status: 'Active',
        comments: 'Management degree program',
      },
      {
        code: 'MCA',
        name: 'Master of Computer Applications',
        campusId: campuses[1]._id,
        duration: 2,
        status: 'Active',
        comments: 'Computer applications degree',
      },
      {
        code: 'BTECH-KKD',
        name: 'Bachelor of Technology',
        campusId: campuses[1]._id,
        duration: 4,
        status: 'Active',
        comments: 'Engineering degree program',
      },
      
      // Vizianagaram Campus Courses
      {
        code: 'BA',
        name: 'Bachelor of Arts',
        campusId: campuses[2]._id,
        duration: 3,
        status: 'Active',
        comments: 'Arts degree program',
      },
      {
        code: 'BSC-VZG',
        name: 'Bachelor of Science',
        campusId: campuses[2]._id,
        duration: 3,
        status: 'Active',
        comments: 'Science degree program',
      },
    ]);
    console.log(`✅ Created ${courses.length} courses`);

    // 3. Create Streams with courseId references
    const btechRaj = courses.find(c => c.code === 'BTECH');
    const btechKkd = courses.find(c => c.code === 'BTECH-KKD');
    const bscRaj = courses.find(c => c.code === 'BSC');
    const bscVzg = courses.find(c => c.code === 'BSC-VZG');
    const bcom = courses.find(c => c.code === 'BCOM');
    const mba = courses.find(c => c.code === 'MBA');
    const mca = courses.find(c => c.code === 'MCA');
    const ba = courses.find(c => c.code === 'BA');

    const streams = await Stream.insertMany([
      // B.Tech streams (Rajamahendravaram)
      {
        courseId: btechRaj._id,
        code: 'CSE',
        name: 'Computer Science and Engineering',
        description: 'Computer Science specialization',
        status: 'Active',
      },
      {
        courseId: btechRaj._id,
        code: 'ECE',
        name: 'Electronics and Communication Engineering',
        description: 'Electronics specialization',
        status: 'Active',
      },
      {
        courseId: btechRaj._id,
        code: 'MECH',
        name: 'Mechanical Engineering',
        description: 'Mechanical specialization',
        status: 'Active',
      },
      
      // B.Tech streams (Kakinada)
      {
        courseId: btechKkd._id,
        code: 'CSE-KKD',
        name: 'Computer Science and Engineering',
        description: 'Computer Science specialization',
        status: 'Active',
      },
      {
        courseId: btechKkd._id,
        code: 'EEE',
        name: 'Electrical and Electronics Engineering',
        description: 'Electrical specialization',
        status: 'Active',
      },
      
      // B.Sc streams (Rajamahendravaram)
      {
        courseId: bscRaj._id,
        code: 'PHYSICS',
        name: 'Physics',
        description: 'Physics specialization',
        status: 'Active',
      },
      {
        courseId: bscRaj._id,
        code: 'CHEMISTRY',
        name: 'Chemistry',
        description: 'Chemistry specialization',
        status: 'Active',
      },
      {
        courseId: bscRaj._id,
        code: 'MATHS',
        name: 'Mathematics',
        description: 'Mathematics specialization',
        status: 'Active',
      },
      
      // B.Sc streams (Vizianagaram)
      {
        courseId: bscVzg._id,
        code: 'BOTANY',
        name: 'Botany',
        description: 'Botany specialization',
        status: 'Active',
      },
      {
        courseId: bscVzg._id,
        code: 'ZOOLOGY',
        name: 'Zoology',
        description: 'Zoology specialization',
        status: 'Active',
      },
      
      // B.Com streams
      {
        courseId: bcom._id,
        code: 'GENERAL',
        name: 'General Commerce',
        description: 'General commerce stream',
        status: 'Active',
      },
      {
        courseId: bcom._id,
        code: 'COMPUTERS',
        name: 'Commerce with Computers',
        description: 'Commerce with computer applications',
        status: 'Active',
      },
      
      // MBA streams
      {
        courseId: mba._id,
        code: 'FINANCE',
        name: 'Finance',
        description: 'Finance specialization',
        status: 'Active',
      },
      {
        courseId: mba._id,
        code: 'MARKETING',
        name: 'Marketing',
        description: 'Marketing specialization',
        status: 'Active',
      },
      {
        courseId: mba._id,
        code: 'HR',
        name: 'Human Resources',
        description: 'HR specialization',
        status: 'Active',
      },
      
      // MCA stream
      {
        courseId: mca._id,
        code: 'GENERAL-MCA',
        name: 'General MCA',
        description: 'General computer applications',
        status: 'Active',
      },
      
      // BA streams
      {
        courseId: ba._id,
        code: 'HISTORY',
        name: 'History',
        description: 'History specialization',
        status: 'Active',
      },
      {
        courseId: ba._id,
        code: 'ECONOMICS',
        name: 'Economics',
        description: 'Economics specialization',
        status: 'Active',
      },
    ]);
    console.log(`✅ Created ${streams.length} streams`);

    res.status(201).json({
      success: true,
      message: 'Sample data seeded successfully',
      data: {
        campuses: campuses.length,
        courses: courses.length,
        streams: streams.length,
      },
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding data',
      error: error.message,
    });
  }
};

// @desc Migrate existing data: Update Courses with campusId from CollegeCourseMapping
// @route POST /api/seed-data/migrate
exports.migrateData = async (req, res) => {
  try {
    console.log('Starting data migration...');
    const CollegeCourseMapping = require("../models/admission/selector/CollegeCourseMapping");
    
    // 1. Get all mappings
    const mappings = await CollegeCourseMapping.find({});
    console.log(`Found ${mappings.length} mappings`);

    let updatedCount = 0;
    let errors = [];

    // 2. Iterate and update courses
    for (const mapping of mappings) {
      if (!mapping.college || !mapping.courses || mapping.courses.length === 0) continue;

      const collegeId = mapping.college;
      const courseIds = mapping.courses;

      console.log(`Mapping College ${collegeId} to ${courseIds.length} courses`);

      const result = await Course.updateMany(
        { _id: { $in: courseIds } },
        { $set: { campusId: collegeId } }
      );
      
      updatedCount += result.modifiedCount;
      console.log(`  Updated ${result.modifiedCount} courses for this college`);
    }

    // 3. Update Streams (optional, purely to ensure they have courseId if missing, but they should have it)
    // Streams usually already have courseId, so we might not need to touch them unless they are broken.
    
    console.log(`✅ Total courses updated: ${updatedCount}`);

    res.status(200).json({
      success: true,
      message: 'Migration completed successfully',
      data: {
        mappingsProcessed: mappings.length,
        coursesUpdated: updatedCount,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error migrating data',
      error: error.message,
    });
  }
};

// @desc Inspect one student data to see fields
// @route GET /api/seed-data/inspect-student
exports.inspectStudent = async (req, res) => {
  try {
    const Student = require("../models/admission/FromStudents");
    const student = await Student.findOne({ status: "Admitted" }).lean();
    
    if (!student) {
      return res.status(404).json({ success: false, message: "No admitted students found" });
    }

    // Also check for CourseStreamMapping if ID exists
    let mapping = null;
    let details = {};
    
    if (student.courseStreamMappingId) {
      const CourseStreamMapping = require("../models/examination/selector/CourseStreamMapping");
      const Course = require("../models/admission/selector/Course");
      const Stream = require("../models/examination/selector/Stream");
      
      mapping = await CourseStreamMapping.findById(student.courseStreamMappingId).lean();
      
      if (mapping) {
        if (mapping.courseId) {
          details.course = await Course.findById(mapping.courseId).select("name code campusId").lean();
        }
        if (mapping.streamId) {
          details.stream = await Stream.findById(mapping.streamId).select("name code").lean();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        student,
        calculatedMapping: mapping,
        details
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Fix orphaned courses by assigning them to the campus of their students
// @route GET /api/seed-data/fix-orphaned
exports.fixOrphanedCourses = async (req, res) => {
  try {
    console.log('Starting orphaned course fix...');
    const Student = require("../models/admission/FromStudents");
    const CourseStreamMapping = require("../models/examination/selector/CourseStreamMapping");
    const Course = require("../models/admission/selector/Course");

    // 1. Find all students with mappings
    const students = await Student.find({ status: "Admitted", courseStreamMappingId: { $ne: null } })
                                  .select("campus courseStreamMappingId")
                                  .lean();
    
    console.log(`Analyzing ${students.length} students...`);
    
    let updatedCount = 0;
    let processedCourses = new Set();
    let updates = [];

    for (const student of students) {
      if (!student.campus) continue;

      const mapping = await CourseStreamMapping.findById(student.courseStreamMappingId).lean();
      if (!mapping || !mapping.courseId) continue;
      
      const courseId = mapping.courseId.toString();
      
      // Skip if likely processed in this loop (simple optimization)
      if (processedCourses.has(courseId)) continue; 

      const course = await Course.findById(courseId).lean();
      if (course && !course.campusId) {
         console.log(`Fixing Course: ${course.name} (${course.code}) -> Campus: ${student.campus}`);
         
         await Course.findByIdAndUpdate(courseId, { $set: { campusId: student.campus } });
         updatedCount++;
         updates.push({ course: course.name, campus: student.campus });
         processedCourses.add(courseId);
      } else if (course && course.campusId) {
         processedCourses.add(courseId); // It's already good
      }
    }

    res.status(200).json({
      success: true,
      message: 'Orphaned courses fixed',
      data: {
        updatedCount,
        updates
      }
    });

  } catch (error) {
    console.error("Error fixing orphaned:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Fix orphaned streams by assigning them to the course from mappings
// @route GET /api/seed-data/fix-orphaned-streams
exports.fixOrphanedStreams = async (req, res) => {
  try {
    console.log('Starting orphaned stream fix...');
    const Student = require("../models/admission/FromStudents");
    const CourseStreamMapping = require("../models/examination/selector/CourseStreamMapping");
    const Stream = require("../models/examination/selector/Stream");

    // 1. Find all students with mappings
    const students = await Student.find({ status: "Admitted", courseStreamMappingId: { $ne: null } })
                                  .select("courseStreamMappingId")
                                  .lean();
    
    console.log(`Analyzing ${students.length} students/mappings...`);
    
    let updatedCount = 0;
    let processedStreams = new Set();
    let updates = [];

    for (const student of students) {
      if (!student.courseStreamMappingId) continue;

      const mapping = await CourseStreamMapping.findById(student.courseStreamMappingId).lean();
      if (!mapping || !mapping.courseId || !mapping.streamId) continue;
      
      const streamId = mapping.streamId.toString();
      const courseId = mapping.courseId.toString();
      
      if (processedStreams.has(streamId)) continue; 

      const stream = await Stream.findById(streamId).lean();
      
      // If stream has NO courseId or WRONG courseId, fix it
      if (stream && (!stream.courseId || stream.courseId.toString() !== courseId)) {
         console.log(`Fixing Stream: ${stream.name} (${stream.code}) -> CourseID: ${courseId}`);
         
         await Stream.findByIdAndUpdate(streamId, { $set: { courseId: courseId } });
         updatedCount++;
         updates.push({ stream: stream.name, courseId: courseId });
         processedStreams.add(streamId);
      } else if (stream) {
         processedStreams.add(streamId);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Orphaned streams fixed',
      data: {
        updatedCount,
        updates
      }
    });

  } catch (error) {
    console.error("Error fixing orphaned streams:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Debug duplicates and mapping links
// @route GET /api/seed-data/debug-duplicates
exports.debugDuplicates = async (req, res) => {
  try {
    const Course = require("../models/admission/selector/Course");
    const CourseStreamMapping = require("../models/examination/selector/CourseStreamMapping");
    
    // 1. Check for duplicates
    const courses = await Course.find({}).lean();
    const nameMap = {};
    const validationErrors = [];
    
    courses.forEach(c => {
      if(!nameMap[c.name]) nameMap[c.name] = [];
      nameMap[c.name].push({ id: c._id, campusId: c.campusId, status: c.status });
    });
    
    const duplicates = {};
    for (const [name, list] of Object.entries(nameMap)) {
      if (list.length > 1) {
        duplicates[name] = list;
      }
    }
    
    // 2. Check which courses have active mappings
    const mappings = await CourseStreamMapping.find({}).lean();
    const mappedCourseIds = [...new Set(mappings.map(m => m.courseId.toString()))];
    
    res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.length,
        duplicates,
        mappedCourseIds,
        // Helper: show if duplicates are mapped
        analysis: Object.entries(duplicates).map(([name, list]) => {
           return {
             name,
             instances: list.map(item => ({
               ...item,
               hasMapping: mappedCourseIds.includes(item.id.toString())
             }))
           };
        })
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
