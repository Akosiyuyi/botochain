import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatsBox from '@/Components/StatsBox';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Table from '@/Components/Table';

export default function StudentsList() {

    const dummyStudents = [
        { id: 1, student_id: "STU2025001", full_name: "Juan Dela Cruz", school_level: "elementary", grade_year: "Grade 5", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 10:00:00" },
        { id: 2, student_id: "STU2025002", full_name: "Maria Santos", school_level: "elementary", grade_year: "Grade 6", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 10:05:00" },
        { id: 3, student_id: "STU2025003", full_name: "Pedro Ramirez", school_level: "junior_high", grade_year: "Grade 9", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 10:10:00" },
        { id: 4, student_id: "STU2025004", full_name: "Angela Reyes", school_level: "junior_high", grade_year: "Grade 10", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 10:15:00" },
        { id: 5, student_id: "STU2025005", full_name: "Carlo Mendoza", school_level: "senior_high", grade_year: "Grade 11", course: "STEM", section: "B", is_graduated: false, created_at: "2025-08-27 10:20:00" },
        { id: 6, student_id: "STU2025006", full_name: "Sophia Gonzales", school_level: "senior_high", grade_year: "Grade 12", course: "ABM", section: "C", is_graduated: false, created_at: "2025-08-27 10:25:00" },
        { id: 7, student_id: "STU2025007", full_name: "Mark Villanueva", school_level: "college", grade_year: "1st Year", course: "BS Computer Science", section: "CS-1A", is_graduated: false, created_at: "2025-08-27 10:30:00" },
        { id: 8, student_id: "STU2025008", full_name: "Hannah Bautista", school_level: "college", grade_year: "2nd Year", course: "BS Information Tech", section: "IT-2B", is_graduated: false, created_at: "2025-08-27 10:35:00" },
        { id: 9, student_id: "STU2025009", full_name: "John Cruz", school_level: "college", grade_year: "3rd Year", course: "BS Accountancy", section: "ACC-3C", is_graduated: false, created_at: "2025-08-27 10:40:00" },
        { id: 10, student_id: "STU2025010", full_name: "Erika Flores", school_level: "college", grade_year: "4th Year", course: "BS Nursing", section: "NRS-4A", is_graduated: true, created_at: "2025-08-27 10:45:00" },
        { id: 11, student_id: "STU2025011", full_name: "Luis Fernandez", school_level: "elementary", grade_year: "Grade 2", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 10:50:00" },
        { id: 12, student_id: "STU2025012", full_name: "Isabella Cruz", school_level: "elementary", grade_year: "Grade 3", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 10:55:00" },
        { id: 13, student_id: "STU2025013", full_name: "Miguel Torres", school_level: "junior_high", grade_year: "Grade 7", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 11:00:00" },
        { id: 14, student_id: "STU2025014", full_name: "Camille Garcia", school_level: "junior_high", grade_year: "Grade 8", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 11:05:00" },
        { id: 15, student_id: "STU2025015", full_name: "Diego Ramirez", school_level: "senior_high", grade_year: "Grade 11", course: "HUMSS", section: "C", is_graduated: false, created_at: "2025-08-27 11:10:00" },
        { id: 16, student_id: "STU2025016", full_name: "Patricia Lim", school_level: "senior_high", grade_year: "Grade 12", course: "STEM", section: "A", is_graduated: false, created_at: "2025-08-27 11:15:00" },
        { id: 17, student_id: "STU2025017", full_name: "Kevin Chua", school_level: "college", grade_year: "1st Year", course: "BSIT", section: "IT-1A", is_graduated: false, created_at: "2025-08-27 11:20:00" },
        { id: 18, student_id: "STU2025018", full_name: "Andrea Mendoza", school_level: "college", grade_year: "2nd Year", course: "BSBA", section: "BA-2B", is_graduated: false, created_at: "2025-08-27 11:25:00" },
        { id: 19, student_id: "STU2025019", full_name: "Joshua Tan", school_level: "college", grade_year: "3rd Year", course: "BS Computer Engineering", section: "CPE-3C", is_graduated: false, created_at: "2025-08-27 11:30:00" },
        { id: 20, student_id: "STU2025020", full_name: "Angela Lee", school_level: "college", grade_year: "4th Year", course: "BS Psychology", section: "PSY-4A", is_graduated: true, created_at: "2025-08-27 11:35:00" },
        { id: 21, student_id: "STU2025021", full_name: "Chris Lim", school_level: "elementary", grade_year: "Grade 1", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 11:40:00" },
        { id: 22, student_id: "STU2025022", full_name: "Jessica Cruz", school_level: "elementary", grade_year: "Grade 4", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 11:45:00" },
        { id: 23, student_id: "STU2025023", full_name: "Daniel Reyes", school_level: "junior_high", grade_year: "Grade 9", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 11:50:00" },
        { id: 24, student_id: "STU2025024", full_name: "Nicole Santos", school_level: "junior_high", grade_year: "Grade 7", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 11:55:00" },
        { id: 25, student_id: "STU2025025", full_name: "Ryan Villanueva", school_level: "senior_high", grade_year: "Grade 12", course: "GAS", section: "B", is_graduated: false, created_at: "2025-08-27 12:00:00" },
    ];
    dummyStudents.push(
        { id: 26, student_id: "STU2025026", full_name: "Elaine Gomez", school_level: "senior_high", grade_year: "Grade 11", course: "ABM", section: "C", is_graduated: false, created_at: "2025-08-27 12:05:00" },
        { id: 27, student_id: "STU2025027", full_name: "Nathan Cruz", school_level: "college", grade_year: "1st Year", course: "BS Civil Engineering", section: "CE-1A", is_graduated: false, created_at: "2025-08-27 12:10:00" },
        { id: 28, student_id: "STU2025028", full_name: "Monica Herrera", school_level: "college", grade_year: "2nd Year", course: "BS Psychology", section: "PSY-2B", is_graduated: false, created_at: "2025-08-27 12:15:00" },
        { id: 29, student_id: "STU2025029", full_name: "Jason Uy", school_level: "college", grade_year: "3rd Year", course: "BS Accountancy", section: "ACC-3A", is_graduated: false, created_at: "2025-08-27 12:20:00" },
        { id: 30, student_id: "STU2025030", full_name: "Rachel Rivera", school_level: "college", grade_year: "4th Year", course: "BSIT", section: "IT-4C", is_graduated: true, created_at: "2025-08-27 12:25:00" },
        { id: 31, student_id: "STU2025031", full_name: "Gabriel Santos", school_level: "elementary", grade_year: "Grade 6", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 12:30:00" },
        { id: 32, student_id: "STU2025032", full_name: "Lara Navarro", school_level: "elementary", grade_year: "Grade 5", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 12:35:00" },
        { id: 33, student_id: "STU2025033", full_name: "Victor Hernandez", school_level: "junior_high", grade_year: "Grade 7", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 12:40:00" },
        { id: 34, student_id: "STU2025034", full_name: "Samantha Ramos", school_level: "junior_high", grade_year: "Grade 8", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 12:45:00" },
        { id: 35, student_id: "STU2025035", full_name: "Kyle Aquino", school_level: "senior_high", grade_year: "Grade 11", course: "STEM", section: "A", is_graduated: false, created_at: "2025-08-27 12:50:00" },
        { id: 36, student_id: "STU2025036", full_name: "Bianca Reyes", school_level: "senior_high", grade_year: "Grade 12", course: "HUMSS", section: "B", is_graduated: false, created_at: "2025-08-27 12:55:00" },
        { id: 37, student_id: "STU2025037", full_name: "Aaron Lim", school_level: "college", grade_year: "1st Year", course: "BSBA", section: "BA-1C", is_graduated: false, created_at: "2025-08-27 13:00:00" },
        { id: 38, student_id: "STU2025038", full_name: "Faith Mendoza", school_level: "college", grade_year: "2nd Year", course: "BS Nursing", section: "NRS-2B", is_graduated: false, created_at: "2025-08-27 13:05:00" },
        { id: 39, student_id: "STU2025039", full_name: "Patrick Torres", school_level: "college", grade_year: "3rd Year", course: "BS Computer Science", section: "CS-3A", is_graduated: false, created_at: "2025-08-27 13:10:00" },
        { id: 40, student_id: "STU2025040", full_name: "Melissa Cruz", school_level: "college", grade_year: "4th Year", course: "BS Marketing", section: "MKT-4B", is_graduated: true, created_at: "2025-08-27 13:15:00" },
        { id: 41, student_id: "STU2025041", full_name: "Adrian Lopez", school_level: "elementary", grade_year: "Grade 1", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 13:20:00" },
        { id: 42, student_id: "STU2025042", full_name: "Sofia Ramirez", school_level: "elementary", grade_year: "Grade 3", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 13:25:00" },
        { id: 43, student_id: "STU2025043", full_name: "Ethan Morales", school_level: "junior_high", grade_year: "Grade 9", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 13:30:00" },
        { id: 44, student_id: "STU2025044", full_name: "Chloe David", school_level: "junior_high", grade_year: "Grade 10", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 13:35:00" },
        { id: 45, student_id: "STU2025045", full_name: "Isaac Tan", school_level: "senior_high", grade_year: "Grade 12", course: "STEM", section: "C", is_graduated: false, created_at: "2025-08-27 13:40:00" },
        { id: 46, student_id: "STU2025046", full_name: "Grace Lee", school_level: "senior_high", grade_year: "Grade 11", course: "GAS", section: "B", is_graduated: false, created_at: "2025-08-27 13:45:00" },
        { id: 47, student_id: "STU2025047", full_name: "Leo Hernandez", school_level: "college", grade_year: "1st Year", course: "BS Mechanical Eng", section: "ME-1A", is_graduated: false, created_at: "2025-08-27 13:50:00" },
        { id: 48, student_id: "STU2025048", full_name: "Clara Bautista", school_level: "college", grade_year: "2nd Year", course: "BS Tourism", section: "TR-2C", is_graduated: false, created_at: "2025-08-27 13:55:00" },
        { id: 49, student_id: "STU2025049", full_name: "Andre Villanueva", school_level: "college", grade_year: "3rd Year", course: "BS Computer Engineering", section: "CPE-3B", is_graduated: false, created_at: "2025-08-27 14:00:00" },
        { id: 50, student_id: "STU2025050", full_name: "Olivia Santos", school_level: "college", grade_year: "4th Year", course: "BS Finance", section: "FIN-4A", is_graduated: true, created_at: "2025-08-27 14:05:00" }
    );
    dummyStudents.push(
        { id: 51, student_id: "STU2025051", full_name: "Diego Ramos", school_level: "elementary", grade_year: "Grade 2", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 14:10:00" },
        { id: 52, student_id: "STU2025052", full_name: "Amelia Flores", school_level: "elementary", grade_year: "Grade 4", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 14:15:00" },
        { id: 53, student_id: "STU2025053", full_name: "Julian Cruz", school_level: "junior_high", grade_year: "Grade 7", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 14:20:00" },
        { id: 54, student_id: "STU2025054", full_name: "Sienna Garcia", school_level: "junior_high", grade_year: "Grade 8", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 14:25:00" },
        { id: 55, student_id: "STU2025055", full_name: "Marcus Lim", school_level: "senior_high", grade_year: "Grade 11", course: "STEM", section: "C", is_graduated: false, created_at: "2025-08-27 14:30:00" },
        { id: 56, student_id: "STU2025056", full_name: "Sophia Navarro", school_level: "senior_high", grade_year: "Grade 12", course: "HUMSS", section: "A", is_graduated: false, created_at: "2025-08-27 14:35:00" },
        { id: 57, student_id: "STU2025057", full_name: "Xavier Tan", school_level: "college", grade_year: "1st Year", course: "BS Information Systems", section: "IS-1A", is_graduated: false, created_at: "2025-08-27 14:40:00" },
        { id: 58, student_id: "STU2025058", full_name: "Diana Mendoza", school_level: "college", grade_year: "2nd Year", course: "BS Psychology", section: "PSY-2A", is_graduated: false, created_at: "2025-08-27 14:45:00" },
        { id: 59, student_id: "STU2025059", full_name: "Joseph Reyes", school_level: "college", grade_year: "3rd Year", course: "BS Accountancy", section: "ACC-3C", is_graduated: false, created_at: "2025-08-27 14:50:00" },
        { id: 60, student_id: "STU2025060", full_name: "Hannah Cruz", school_level: "college", grade_year: "4th Year", course: "BSIT", section: "IT-4B", is_graduated: true, created_at: "2025-08-27 14:55:00" },
        { id: 61, student_id: "STU2025061", full_name: "Lucas Torres", school_level: "elementary", grade_year: "Grade 5", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 15:00:00" },
        { id: 62, student_id: "STU2025062", full_name: "Mia Lopez", school_level: "elementary", grade_year: "Grade 6", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 15:05:00" },
        { id: 63, student_id: "STU2025063", full_name: "Carlos Herrera", school_level: "junior_high", grade_year: "Grade 9", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 15:10:00" },
        { id: 64, student_id: "STU2025064", full_name: "Isabella Ramos", school_level: "junior_high", grade_year: "Grade 10", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 15:15:00" },
        { id: 65, student_id: "STU2025065", full_name: "Evan Bautista", school_level: "senior_high", grade_year: "Grade 11", course: "ABM", section: "B", is_graduated: false, created_at: "2025-08-27 15:20:00" },
        { id: 66, student_id: "STU2025066", full_name: "Layla David", school_level: "senior_high", grade_year: "Grade 12", course: "STEM", section: "C", is_graduated: false, created_at: "2025-08-27 15:25:00" },
        { id: 67, student_id: "STU2025067", full_name: "Tristan Gomez", school_level: "college", grade_year: "1st Year", course: "BSBA", section: "BA-1B", is_graduated: false, created_at: "2025-08-27 15:30:00" },
        { id: 68, student_id: "STU2025068", full_name: "Maya Cruz", school_level: "college", grade_year: "2nd Year", course: "BS Civil Engineering", section: "CE-2B", is_graduated: false, created_at: "2025-08-27 15:35:00" },
        { id: 69, student_id: "STU2025069", full_name: "Ryan Santos", school_level: "college", grade_year: "3rd Year", course: "BS Computer Science", section: "CS-3B", is_graduated: false, created_at: "2025-08-27 15:40:00" },
        { id: 70, student_id: "STU2025070", full_name: "Julia Reyes", school_level: "college", grade_year: "4th Year", course: "BS Marketing", section: "MKT-4A", is_graduated: true, created_at: "2025-08-27 15:45:00" },
        { id: 71, student_id: "STU2025071", full_name: "Anthony Lim", school_level: "elementary", grade_year: "Grade 1", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 15:50:00" },
        { id: 72, student_id: "STU2025072", full_name: "Natalie Cruz", school_level: "elementary", grade_year: "Grade 3", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 15:55:00" },
        { id: 73, student_id: "STU2025073", full_name: "Zachary Uy", school_level: "junior_high", grade_year: "Grade 7", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 16:00:00" },
        { id: 74, student_id: "STU2025074", full_name: "Ella Navarro", school_level: "junior_high", grade_year: "Grade 8", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 16:05:00" },
        { id: 75, student_id: "STU2025075", full_name: "Christian Ramos", school_level: "senior_high", grade_year: "Grade 11", course: "HUMSS", section: "A", is_graduated: false, created_at: "2025-08-27 16:10:00" }
    );
    dummyStudents.push(
        { id: 76, student_id: "STU2025076", full_name: "Angela Cruz", school_level: "senior_high", grade_year: "Grade 12", course: "ABM", section: "C", is_graduated: false, created_at: "2025-08-27 16:15:00" },
        { id: 77, student_id: "STU2025077", full_name: "Benjamin Garcia", school_level: "college", grade_year: "1st Year", course: "BS Entrepreneurship", section: "ENT-1A", is_graduated: false, created_at: "2025-08-27 16:20:00" },
        { id: 78, student_id: "STU2025078", full_name: "Camila Torres", school_level: "college", grade_year: "2nd Year", course: "BS Political Science", section: "POL-2A", is_graduated: false, created_at: "2025-08-27 16:25:00" },
        { id: 79, student_id: "STU2025079", full_name: "Dominic Ramos", school_level: "college", grade_year: "3rd Year", course: "BS Architecture", section: "ARCH-3A", is_graduated: false, created_at: "2025-08-27 16:30:00" },
        { id: 80, student_id: "STU2025080", full_name: "Emily Santos", school_level: "college", grade_year: "4th Year", course: "BS Nursing", section: "NUR-4B", is_graduated: true, created_at: "2025-08-27 16:35:00" },
        { id: 81, student_id: "STU2025081", full_name: "Francis Dela Cruz", school_level: "elementary", grade_year: "Grade 1", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 16:40:00" },
        { id: 82, student_id: "STU2025082", full_name: "Gabriella Uy", school_level: "elementary", grade_year: "Grade 2", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 16:45:00" },
        { id: 83, student_id: "STU2025083", full_name: "Henry Flores", school_level: "elementary", grade_year: "Grade 4", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 16:50:00" },
        { id: 84, student_id: "STU2025084", full_name: "Isla Navarro", school_level: "elementary", grade_year: "Grade 6", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 16:55:00" },
        { id: 85, student_id: "STU2025085", full_name: "Jacob Tan", school_level: "junior_high", grade_year: "Grade 7", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 17:00:00" },
        { id: 86, student_id: "STU2025086", full_name: "Kylie Ramos", school_level: "junior_high", grade_year: "Grade 8", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 17:05:00" },
        { id: 87, student_id: "STU2025087", full_name: "Lorenzo Reyes", school_level: "junior_high", grade_year: "Grade 9", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 17:10:00" },
        { id: 88, student_id: "STU2025088", full_name: "Madison Cruz", school_level: "junior_high", grade_year: "Grade 10", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 17:15:00" },
        { id: 89, student_id: "STU2025089", full_name: "Nathan Lim", school_level: "senior_high", grade_year: "Grade 11", course: "STEM", section: "B", is_graduated: false, created_at: "2025-08-27 17:20:00" },
        { id: 90, student_id: "STU2025090", full_name: "Olivia David", school_level: "senior_high", grade_year: "Grade 12", course: "HUMSS", section: "C", is_graduated: false, created_at: "2025-08-27 17:25:00" },
        { id: 91, student_id: "STU2025091", full_name: "Patrick Gomez", school_level: "college", grade_year: "1st Year", course: "BS Criminology", section: "CRM-1B", is_graduated: false, created_at: "2025-08-27 17:30:00" },
        { id: 92, student_id: "STU2025092", full_name: "Queenie Ramos", school_level: "college", grade_year: "2nd Year", course: "BS Medical Technology", section: "MT-2A", is_graduated: false, created_at: "2025-08-27 17:35:00" },
        { id: 93, student_id: "STU2025093", full_name: "Robert Tan", school_level: "college", grade_year: "3rd Year", course: "BS Electrical Engineering", section: "EE-3A", is_graduated: false, created_at: "2025-08-27 17:40:00" },
        { id: 94, student_id: "STU2025094", full_name: "Sophia Torres", school_level: "college", grade_year: "4th Year", course: "BS Biology", section: "BIO-4A", is_graduated: true, created_at: "2025-08-27 17:45:00" },
        { id: 95, student_id: "STU2025095", full_name: "Thomas Cruz", school_level: "elementary", grade_year: "Grade 3", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 17:50:00" },
        { id: 96, student_id: "STU2025096", full_name: "Uma Bautista", school_level: "elementary", grade_year: "Grade 5", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 17:55:00" },
        { id: 97, student_id: "STU2025097", full_name: "Victor Herrera", school_level: "junior_high", grade_year: "Grade 7", course: null, section: "D", is_graduated: false, created_at: "2025-08-27 18:00:00" },
        { id: 98, student_id: "STU2025098", full_name: "Willow Ramos", school_level: "junior_high", grade_year: "Grade 9", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 18:05:00" },
        { id: 99, student_id: "STU2025099", full_name: "Xander Flores", school_level: "senior_high", grade_year: "Grade 11", course: "ABM", section: "A", is_graduated: false, created_at: "2025-08-27 18:10:00" },
        { id: 100, student_id: "STU2025100", full_name: "Yvette Cruz", school_level: "college", grade_year: "1st Year", course: "BS Tourism Management", section: "TM-1A", is_graduated: false, created_at: "2025-08-27 18:15:00" }
    );





    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                    Students List
                </h2>
            }
            button={
                <div className="flex gap-4">
                    <PrimaryButton>Add Student</PrimaryButton>
                    <Link href={route("admin.bulk-upload.index")}>
                        <SecondaryButton>Upload CSV</SecondaryButton>
                    </Link>

                </div>
            }
        >
            <Head title="Students" />

            <div className="">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <StatsBox />
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mt-6">
                        <Table
                            rows={dummyStudents}
                            header={[
                                { key: "student_id", label: "Student ID", sortable: true },
                                { key: "full_name", label: "Full Name", sortable: true },
                                { key: "school_level", label: "School Level" },
                                { key: "grade_year", label: "Grade/Year" },
                                { key: "course", label: "Course" },
                                { key: "section", label: "Section" },
                                { key: "status", label: "Status" },
                                { key: "action", label: "Action" },
                            ]}
                            optionList={["All", "Enrolled", "Unenrolled"]}
                            defaultOption="All"
                            onEdit={(student) => console.log("Edit student:", student)}
                            renderCell={(row, key, { onEdit }) => {
                                if (key === "status") {
                                    return row.is_graduated ? (
                                        <span className="text-red-600">Unenrolled</span>
                                    ) : (
                                        <span className="text-green-600">Enrolled</span>
                                    );
                                }
                                if (key === "action") {
                                    return (
                                        <button onClick={() => onEdit(row)} className="text-blue-600 hover:underline">
                                            Edit
                                        </button>
                                    );
                                }
                                return row[key];
                            }}
                            filterFn={(row, option, defaultOption) => {
                                if (option === defaultOption) return true;

                                if (option === "Enrolled") {
                                    return !row.is_graduated;
                                }
                                if (option === "Unenrolled") {
                                    return row.is_graduated;
                                }
                                return true;
                            }}
                            getHeaderTitle={(option) => (option === "All" ? "All Students List" : `${option} Student List`)}
                            getHeaderSubtitle={(option) => (option === "All" ? "Includes all registered students, enrolled and unenrolled." : `List of all registered ${option.toLowerCase()} students only.`)}
                            searchPlaceholder="Search students..."
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
