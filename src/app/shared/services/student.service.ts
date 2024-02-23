import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';

import { Observable, Subject, defer, throwError } from 'rxjs';
import { tap, exhaustMap, shareReplay, catchError, map, concatMap } from 'rxjs/operators';

import { Firestore, collection, orderBy, query, addDoc, updateDoc, serverTimestamp, deleteDoc, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';


import { FIRESTORE } from '../../app.config';
import { Student, StudentState } from '../interfaces/students';
import { toSignal } from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private fireStore: Firestore = inject(FIRESTORE);

  public addStudentSubject$ = new Subject<Partial<Student>>();
  public deleteStudentSubject$ = new Subject<string>();
  public updateStudentSubject$ = new Subject<Partial<Student>>();

  private state: WritableSignal<StudentState> = signal<StudentState>({
    error: null,
    loading: false,
    selectedStudent: null
  });


  private students$: Observable<Student[]> = this.fetchStudents().pipe(
    shareReplay(1),
    catchError(this.handleError));

  public students: Signal<Student[]> = toSignal(this.students$, { initialValue: [] });
  public studentCount: Signal<Record<string, number>> = computed(() => {
    const studentCount = this.students().reduce((accumulator, student) => {
      if (accumulator.hasOwnProperty(student.group)) {
        return { ...accumulator, [student.group]: accumulator[student.group as keyof typeof accumulator] + 1 };
      } else {
        return { ...accumulator, [student.group]: 1 };
      }
    }, {})

    return studentCount
  })

  public loading: Signal<boolean> = computed(() => this.state().loading);
  public error: Signal<string | null> = computed(() => this.state().error);
  public selectedStudent: Signal<Student | null> = computed(() => this.state().selectedStudent);

  constructor() {
    toSignal(
      this.deleteStudentSubject$.pipe(
        exhaustMap(id => this.deleteStudentRequest(id)),
        catchError(this.handleError))
    )
  }

  public addStudent(): Observable<DocumentReference<DocumentData, DocumentData>> {
    return this.addStudentSubject$.pipe(
      exhaustMap((student) => this.addStudentRequest(student)),
      catchError(this.handleError))
  }

  public updateStudent(): Observable<void> {
    return this.updateStudentSubject$.pipe(
      exhaustMap((student) => this.updateStudentRequest(student)),
      catchError(this.handleError)
    )
  }


  public selectStudent(student: Student) {
    return this.state.update((state) => ({ ...state, selectedStudent: student }))
  }

  private fetchStudents(): Observable<Student[]> {
    const studentsCollection = query(
      collection(this.fireStore, 'students'),
      orderBy('createdAt', 'desc')
    )

    return collectionData(studentsCollection, { idField: 'id' }) as Observable<Student[]>
  }

  private addStudentRequest(student: Partial<Student>): Observable<DocumentReference<DocumentData, DocumentData>> {
    const newStudent = {
      ...student,
      createdAt: serverTimestamp()
    }

    return defer(() => addDoc(collection(this.fireStore, 'students'), newStudent))
  }

  private updateStudentRequest(student: Partial<Student>): Observable<void> {
    const newStudent = {
      firstName: student.firstName,
      lastName: student.lastName,
      group: student.group,
    }

    const decRef = doc(this.fireStore, 'students', student.id as string)
    return defer(() => updateDoc(decRef, newStudent))
  }

  private deleteStudentRequest(id: string): Observable<void> {
    const decRef = doc(this.fireStore, 'students', id)
    return defer(() => deleteDoc(decRef))
  }

  private handleError(err: any): Observable<never> {
    let errorMessage = '';

    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message
        }`;
    }
    console.error(errorMessage);
    this.state.update((state) => ({
      ...state,
      error: errorMessage
    }));
    return throwError(() => errorMessage);
  }
}
