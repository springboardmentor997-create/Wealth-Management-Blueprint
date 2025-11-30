import java.util.ArrayList;
import java.util.Scanner;

class Subject {
    private String name;
    private double marks;
    
    public Subject(String name, double marks) {
        this.name = name;
        this.marks = marks;
    }
    
    public String getName() {
        return name;
    }
    
    public double getMarks() {
        return marks;
    }
}

class GradeResult {
    private double totalMarks;
    private double averagePercentage;
    private String grade;
    private String gradeDescription;
    
    public GradeResult(double totalMarks, double averagePercentage, String grade, String gradeDescription) {
        this.totalMarks = totalMarks;
        this.averagePercentage = averagePercentage;
        this.grade = grade;
        this.gradeDescription = gradeDescription;
    }
    
    public void display() {
        System.out.println("\n===== GRADE CALCULATION RESULTS =====");
        System.out.println("Total Marks: " + String.format("%.2f", totalMarks));
        System.out.println("Average Percentage: " + String.format("%.2f", averagePercentage) + "%");
        System.out.println("Grade: " + grade);
        System.out.println("Grade Description: " + gradeDescription);
        System.out.println("=====================================");
    }
}

public class GradeCalculator {
    
    public static GradeResult calculateGrade(ArrayList<Subject> subjects) {
        double totalMarks = 0;
        
        // Calculate total marks
        for (Subject subject : subjects) {
            totalMarks += subject.getMarks();
        }
        
        // Calculate average percentage
        double averagePercentage = totalMarks / subjects.size();
        
        // Determine grade
        String grade;
        String gradeDescription;
        
        if (averagePercentage >= 90) {
            grade = "A";
            gradeDescription = "Excellent";
        } else if (averagePercentage >= 80) {
            grade = "B";
            gradeDescription = "Very Good";
        } else if (averagePercentage >= 70) {
            grade = "C";
            gradeDescription = "Good";
        } else if (averagePercentage >= 60) {
            grade = "D";
            gradeDescription = "Satisfactory";
        } else {
            grade = "F";
            gradeDescription = "Needs Improvement";
        }
        
        return new GradeResult(totalMarks, averagePercentage, grade, gradeDescription);
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        ArrayList<Subject> subjects = new ArrayList<>();
        
        System.out.println("===== GRADE CALCULATOR =====");
        System.out.print("Enter number of subjects: ");
        int numSubjects = scanner.nextInt();
        scanner.nextLine(); // Consume newline
        
        // Input subjects and marks
        for (int i = 0; i < numSubjects; i++) {
            System.out.print("\nEnter name of subject " + (i + 1) + ": ");
            String name = scanner.nextLine();
            
            double marks;
            while (true) {
                System.out.print("Enter marks obtained (out of 100): ");
                marks = scanner.nextDouble();
                scanner.nextLine(); // Consume newline
                
                if (marks >= 0 && marks <= 100) {
                    break;
                } else {
                    System.out.println("Invalid marks! Please enter a value between 0 and 100.");
                }
            }
            
            subjects.add(new Subject(name, marks));
        }
        
        // Calculate and display results
        GradeResult result = calculateGrade(subjects);
        result.display();
        
        // Display grading scale
        System.out.println("\n===== GRADING SCALE =====");
        System.out.println("A (90-100): Excellent");
        System.out.println("B (80-89): Very Good");
        System.out.println("C (70-79): Good");
        System.out.println("D (60-69): Satisfactory");
        System.out.println("F (0-59): Needs Improvement");
        System.out.println("=========================");
        
        scanner.close();
    }
}
