package com.example.TaskSync.Repository;

import com.example.TaskSync.Entity.Pomodoro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PomodoroRepository extends JpaRepository<Pomodoro, Long> {
}
